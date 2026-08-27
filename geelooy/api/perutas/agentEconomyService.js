// B"H
const crypto = require("crypto");
const { normalizeAmounts } = require("./accountService.js");
const { pushLedger } = require("./ledgerService.js");
const { zeroWorldTotals } = require("./resourceWorldService.js");
const guard = require("./budgets/budgetGuardService.js");

/**
 * B"H
 * Chapter 806: The agent received not only a purse, but a fence.
 * Agent spend now asks the budget gate before touching balances, so a runaway
 * malach cannot consume the treasury beyond its covenant.
 */
function registerAgent(store, ownerId, input = {}) {
  store.perutaAgents = store.perutaAgents || {};
  const id = input.id || `agent_${crypto.randomBytes(5).toString("hex")}`;
  const agent = store.perutaAgents[id] || {
    id,
    ownerId,
    organizationId: input.organizationId || null,
    name: input.name || "Awtsmoos Agent",
    status: "active",
    balances: zeroWorldTotals(),
    earned: zeroWorldTotals(),
    spent: zeroWorldTotals(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.perutaAgents[id] = agent;
  pushLedger(store, { userId: ownerId, kind: "agent_registered", agentId: id, orgId: agent.organizationId, meta: { name: agent.name } });
  return clone(agent);
}
function fundAgent(store, agentId, amounts, meta = {}) {
  const agent = mustAgent(store, agentId);
  const got = normalizeAmounts(amounts);
  addTo(agent.balances, got, 1);
  agent.updatedAt = new Date().toISOString();
  pushLedger(store, { userId: meta.by || agent.ownerId, kind: "agent_funded", agentId, amounts: got, balances: agent.balances, meta });
  return clone(agent);
}
function spend(store, agentId, amounts, meta = {}) {
  const agent = mustAgent(store, agentId);
  const got = normalizeAmounts(amounts);
  const gate = guard.guardAndCommitMany(store, [
    { entityType: "agent", entityId: agentId, amounts: got, meta: { agentId } },
    { entityType: "user", entityId: meta.userId || agent.ownerId, amounts: got, meta: { agentId } }
  ], { userId: meta.userId || agent.ownerId, action: "agent_spend" });
  if (!gate.ok) return { ok: false, blocked: true, error: gate.error, guard: gate, agent: clone(agent) };
  addTo(agent.balances, got, -1);
  addTo(agent.spent, got, 1);
  agent.updatedAt = new Date().toISOString();
  pushLedger(store, { userId: meta.userId || agent.ownerId, kind: "agent_spend", agentId, amounts: negate(got), balances: agent.balances, meta: { ...meta, budgetGate: gate } });
  return clone(agent);
}
function income(store, agentId, amounts, meta = {}) {
  const agent = mustAgent(store, agentId);
  const got = normalizeAmounts(amounts);
  addTo(agent.balances, got, 1);
  addTo(agent.earned, got, 1);
  agent.updatedAt = new Date().toISOString();
  pushLedger(store, { userId: meta.userId || agent.ownerId, kind: "agent_income", agentId, amounts: got, balances: agent.balances, meta });
  return clone(agent);
}
function listAgents(store, ownerId) { return Object.values(store.perutaAgents || {}).filter(agent => !ownerId || agent.ownerId === ownerId).map(clone); }
function agentFor(store, agentId) { const agent = (store.perutaAgents || {})[agentId]; return agent ? clone(agent) : null; }
function summary(store) { return { agents: Object.values(store.perutaAgents || {}).map(clone) }; }
function mustAgent(store, agentId) { const agent = (store.perutaAgents || {})[agentId]; if (!agent) throw new Error(`agent_not_found:${agentId}`); return agent; }
function addTo(target, amounts, sign) { for (const key of Object.keys(target)) target[key] = Number(target[key] || 0) + sign * Number(amounts[key] || 0); }
function negate(amounts) { return Object.fromEntries(Object.entries(amounts).map(([key, value]) => [key, -Number(value || 0)])); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
module.exports = { agentFor, fundAgent, income, listAgents, registerAgent, spend, summary };
