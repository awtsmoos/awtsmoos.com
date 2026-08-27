// B"H

/** B"H: Treasury graph gathers users, agents, organizations, services, providers, receipts, and ledgers. */
function graph(store, userId = null) {
  const nodes = new Map();
  const edges = [];
  node(nodes, "treasury", "Treasury", "treasury");
  for (const account of Object.values(store.perutaAccounts || {})) if (!userId || account.userId === userId) node(nodes, `user:${account.userId}`, account.userId, "user", account.balances);
  for (const org of Object.values(store.perutaOrganizations || {})) { node(nodes, `org:${org.id}`, org.name, "organization", org.balances); edge(edges, `user:${org.ownerId}`, `org:${org.id}`, "owns", 1); }
  for (const agent of Object.values(store.perutaAgents || {})) { node(nodes, `agent:${agent.id}`, agent.name, "agent", agent.balances); edge(edges, `user:${agent.ownerId}`, `agent:${agent.id}`, "owns", 1); if (agent.organizationId) edge(edges, `org:${agent.organizationId}`, `agent:${agent.id}`, "funds", 1); }
  for (const service of Object.values(store.perutaMarketplace?.services || {})) { node(nodes, `service:${service.id}`, service.title, "service", service.price); if (service.agentId) edge(edges, `agent:${service.agentId}`, `service:${service.id}`, "offers", 1); }
  for (const receipt of store.perutaReceipts || []) { node(nodes, `receipt:${receipt.id}`, receipt.offerName || receipt.id, "receipt", receipt.after); edge(edges, "treasury", `user:${receipt.userId}`, "receipt", sum(receipt.after)); }
  for (const margin of store.perutaProviderMargins || []) { node(nodes, `provider:${margin.provider}`, margin.provider, "provider"); edge(edges, `user:${margin.userId}`, `provider:${margin.provider}`, "provider_margin", margin.marginPerutas); }
  return { ok: true, nodes: [...nodes.values()], edges };
}
function node(nodes, id, label, type, meta = {}) { if (!nodes.has(id)) nodes.set(id, { id, label, type, meta }); }
function edge(edges, from, to, label, amount) { if (from && to) edges.push({ from, to, label, amount: Number(amount || 0) }); }
function sum(x = {}) { return Object.values(x || {}).reduce((a, b) => a + Number(b || 0), 0); }
module.exports = { graph };
