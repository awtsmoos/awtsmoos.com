// B"H
const { normalizeAmounts } = require("../accountService.js");
const { ORDER } = require("../resourceWorldService.js");
const budgets = require("./budgetService.js");
const { pushLedger } = require("../ledgerService.js");

/**
 * B"H
 * Chapter 810: The gatekeeper learned the names of each coin.
 * A total fence is not enough: routing may overflow while compute sleeps.
 * Therefore every world is checked by its own covenant before spend mutates.
 */
function guardSpend(store, entityType, entityId, amounts, meta = {}) {
  const got = normalizeAmounts(amounts);
  const active = budgets.summary(store, entityType, entityId).budgets || [];
  const preview = active.map(budget => previewBudget(budget, got));
  const blocked = preview.some(row => row.overLimit);
  if (blocked) {
    pushLedger(store, {
      userId: meta.userId || entityId,
      kind: "budget_blocked_attempt",
      amounts: got,
      meta: {
        ...meta,
        entityType,
        entityId,
        budgets: preview.filter(row => row.overLimit).map(row => row.id),
        categories: [...new Set(preview.flatMap(row => row.categoryOverLimit || []))]
      }
    });
    return { ok: false, blocked: true, entityType, entityId, amounts: got, budgets: preview, error: "budget_exceeded" };
  }
  return { ok: true, blocked: false, entityType, entityId, amounts: got, budgets: preview };
}
function commitSpend(store, entityType, entityId, amounts, meta = {}) {
  const gate = guardSpend(store, entityType, entityId, amounts, meta);
  if (!gate.ok) return gate;
  return budgets.recordSpend(store, entityType, entityId, amounts, meta);
}
function guardAndCommitMany(store, checks = [], meta = {}) {
  const previews = [];
  for (const check of checks) {
    const gate = guardSpend(store, check.entityType, check.entityId, check.amounts, { ...meta, ...check.meta });
    previews.push(gate);
    if (!gate.ok) return { ok: false, blocked: true, error: "budget_exceeded", previews };
  }
  const commits = checks.map(check => budgets.recordSpend(store, check.entityType, check.entityId, check.amounts, { ...meta, ...check.meta }));
  return { ok: true, blocked: false, previews, commits };
}
function previewBudget(budget, amounts) {
  const projectedSpent = add(budget.spent, amounts);
  const totalLimit = Math.max(1, sum(budget.limits));
  const projectedPercent = round((sum(projectedSpent) / totalLimit) * 100);
  const categoryPercents = categoryPercent(projectedSpent, budget.limits);
  const categoryOverLimit = ORDER.filter(key => isCategoryOver(projectedSpent[key], budget.limits[key]));
  const categoryWarnings = ORDER.filter(key => categoryPercents[key] >= 80);
  const overLimit = projectedPercent >= 100 || categoryOverLimit.length > 0;
  const warning = overLimit || projectedPercent >= 80 || categoryWarnings.length > 0;
  return { ...budget, projectedSpent, projectedPercent, categoryPercents, categoryWarnings, categoryOverLimit, warning, overLimit };
}
function categoryPercent(spent = {}, limits = {}) {
  const out = {};
  for (const key of ORDER) {
    const limit = Number(limits[key] || 0);
    out[key] = limit <= 0 ? (Number(spent[key] || 0) > 0 ? 999 : 0) : round((Number(spent[key] || 0) / limit) * 100);
  }
  return out;
}
function isCategoryOver(spent, limit) {
  const s = Number(spent || 0);
  const l = Number(limit || 0);
  return l <= 0 ? s > 0 : s > l;
}
function add(a = {}, b = {}) {
  const out = {};
  for (const key of ORDER) out[key] = Number(a[key] || 0) + Number(b[key] || 0);
  return out;
}
function sum(value = {}) { return ORDER.reduce((total, key) => total + Number(value[key] || 0), 0); }
function round(n) { return Math.round(Number(n || 0) * 10) / 10; }
module.exports = { commitSpend, guardAndCommitMany, guardSpend };
