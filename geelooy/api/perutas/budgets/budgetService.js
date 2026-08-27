// B"H
const crypto = require("crypto");
const { normalizeAmounts } = require("../accountService.js");
const { pushLedger } = require("../ledgerService.js");
const { ORDER, zeroWorldTotals } = require("../resourceWorldService.js");

/**
 * B"H
 * Chapter 801: A budget is a fence made of mercy.
 * It does not hide the flow; it teaches every vessel how much light it may draw
 * before the treasury whispers warning, then blocks waste.
 */
function createBudget(store, ownerId, input = {}) {
  store.perutaBudgets = store.perutaBudgets || {};
  const id = input.id || `budget_${crypto.randomBytes(5).toString("hex")}`;
  const budget = {
    id,
    ownerId,
    entityType: input.entityType || "user",
    entityId: input.entityId || ownerId,
    name: input.name || "Treasury Budget",
    period: input.period || "monthly",
    limits: normalizeAmounts(input.limits || input),
    spent: zeroWorldTotals(),
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.perutaBudgets[id] = budget;
  pushLedger(store, { userId: ownerId, kind: "budget_created", budgetId: id, amounts: budget.limits, meta: budget });
  return clone(budget);
}
function recordSpend(store, entityType, entityId, amounts, meta = {}) {
  const budgets = matching(store, entityType, entityId);
  const got = normalizeAmounts(amounts);
  const results = budgets.map(budget => applySpend(store, budget, got, meta));
  return { ok: true, blocked: results.some(row => row.overLimit), budgets: results };
}
function summary(store, entityType = null, entityId = null) {
  const budgets = Object.values(store.perutaBudgets || {}).filter(budget => (!entityType || budget.entityType === entityType) && (!entityId || budget.entityId === entityId));
  return { ok: true, budgets: budgets.map(withPercent) };
}
function applySpend(store, budget, amounts, meta) {
  for (const key of ORDER) budget.spent[key] = Number(budget.spent[key] || 0) + Number(amounts[key] || 0);
  budget.updatedAt = new Date().toISOString();
  const evaluated = withPercent(budget);
  const kind = evaluated.overLimit ? "budget_blocked" : evaluated.warning ? "budget_warning" : "budget_updated";
  pushLedger(store, { userId: budget.ownerId, kind, budgetId: budget.id, amounts, meta: { ...meta, percent: evaluated.percent } });
  return evaluated;
}
function matching(store, entityType, entityId) {
  return Object.values(store.perutaBudgets || {}).filter(budget => budget.status === "active" && budget.entityType === entityType && budget.entityId === entityId);
}
function withPercent(budget) {
  const spent = sum(budget.spent);
  const limit = Math.max(1, sum(budget.limits));
  const percent = Math.round((spent / limit) * 1000) / 10;
  return { ...clone(budget), percent, warning: percent >= 80, overLimit: percent >= 100, remaining: remaining(budget) };
}
function remaining(budget) {
  const out = {};
  for (const key of ORDER) out[key] = Number(budget.limits[key] || 0) - Number(budget.spent[key] || 0);
  return out;
}
function sum(value = {}) { return ORDER.reduce((total, key) => total + Number(value[key] || 0), 0); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
module.exports = { createBudget, recordSpend, summary };
