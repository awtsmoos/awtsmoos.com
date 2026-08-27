// B"H
const { ORDER, normalizeWorldTotals, worldFor, zeroWorldTotals } = require("./resourceWorldService.js");

/**
 * B"H
 * Chapter 612: The ledger became a river map.
 * Each entry is still a number, but the user sees movement: source, vessel,
 * destination, and world. No unlogged spend is invented here.
 */
function flowSummary(store, userId, limit = 160) {
  const ledger = ledgerEntries(store, userId, limit);
  const usage = usageEntries(store, userId, limit);
  const totals = totalsFor(ledger);
  const nodes = nodeMap(userId);
  const edges = [];
  for (const entry of ledger) addLedgerEdge(nodes, edges, entry);
  for (const event of usage.slice(0, 60)) addUsageEdge(nodes, edges, event);
  return { nodes: [...nodes.values()], edges, totals, rivers: riversFor(totals), ledger, usage };
}
function ledgerEntries(store, userId, limit) {
  return (store.perutaLedger || []).filter(x => !userId || x.userId === userId).slice(-limit).reverse();
}
function usageEntries(store, userId, limit) {
  return (store.usageEvents || []).filter(x => !userId || x.userId === userId).slice(-limit).reverse();
}
function nodeMap(userId) {
  const nodes = new Map();
  addNode(nodes, "treasury", "Treasury", "treasury");
  addNode(nodes, `user:${userId || "all"}`, userId || "All Users", "user");
  return nodes;
}
function addLedgerEdge(nodes, edges, entry) {
  const user = `user:${entry.userId || "anonymous"}`;
  addNode(nodes, user, entry.userId || "anonymous", "user");
  const kind = entry.kind || "ledger";
  const resource = entry.category || firstAmountKey(entry.amounts) || "routing";
  const amount = amountFor(entry, resource);
  const source = amount >= 0 ? "treasury" : user;
  const target = amount >= 0 ? user : nodeForKind(nodes, kind);
  edges.push(edge(source, target, resource, Math.abs(amount), kind, entry.at));
}
function addUsageEdge(nodes, edges, event) {
  const user = `user:${event.userId || "anonymous"}`;
  const vessel = `vessel:${event.routeType || event.action || "unknown"}`;
  addNode(nodes, user, event.userId || "anonymous", "user");
  addNode(nodes, vessel, event.routeType || event.action || "Unknown Vessel", "vessel");
  edges.push(edge(user, vessel, event.category || "routing", Math.max(0, Number(event.bytes || event.seconds || 1)), event.action || "usage", event.at));
}
function nodeForKind(nodes, kind) {
  const id = `sink:${kind}`;
  addNode(nodes, id, kind, "sink");
  return id;
}
function addNode(nodes, id, label, type) { if (!nodes.has(id)) nodes.set(id, { id, label, type }); }
function edge(from, to, resource, amount, label, at) { return { from, to, resource, world: worldFor(resource), amount: Number(amount || 0), label, at }; }
function totalsFor(entries) {
  const incoming = zeroWorldTotals();
  const outgoing = zeroWorldTotals();
  for (const entry of entries) {
    for (const key of ORDER) {
      const amount = amountFor(entry, key);
      if (amount > 0) incoming[key] += amount;
      if (amount < 0) outgoing[key] += Math.abs(amount);
    }
  }
  return { incoming: normalizeWorldTotals(incoming), outgoing: normalizeWorldTotals(outgoing) };
}
function amountFor(entry, key) {
  if (entry.amounts && Object.prototype.hasOwnProperty.call(entry.amounts, key)) return Number(entry.amounts[key] || 0);
  if (entry.category === key && entry.perutas) return Number(entry.perutas || 0);
  return 0;
}
function firstAmountKey(amounts = {}) { return ORDER.find(key => Number(amounts[key] || 0) !== 0) || null; }
function riversFor(totals) { return ORDER.map(key => ({ key, world: worldFor(key), incoming: totals.incoming[key], outgoing: totals.outgoing[key] })); }
module.exports = { flowSummary };
