// B"H
const crypto = require("crypto");
const { addCredits, normalizeAmounts } = require("./accountService.js");
const { pushLedger } = require("./ledgerService.js");
const { normalizeWorldTotals, zeroWorldTotals } = require("./resourceWorldService.js");

/**
 * B"H
 * Chapter 701: The lone user became a house of builders.
 * An organization is not a bypass; it is a shared vessel with auditable members,
 * balances, allocations, and ledger marks in all four worlds.
 */
function createOrganization(store, ownerId, input = {}) {
  store.perutaOrganizations = store.perutaOrganizations || {};
  const id = input.id || `org_${crypto.randomBytes(5).toString("hex")}`;
  const org = store.perutaOrganizations[id] || {
    id,
    name: input.name || "Awtsmoos Organization",
    ownerId,
    members: {},
    balances: zeroWorldTotals(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  org.members[ownerId] = org.members[ownerId] || { userId: ownerId, role: "owner", joinedAt: new Date().toISOString() };
  store.perutaOrganizations[id] = org;
  pushLedger(store, { userId: ownerId, kind: "organization_created", orgId: id, meta: { name: org.name } });
  return clone(org);
}
function addMember(store, orgId, userId, role = "member") {
  const org = mustOrg(store, orgId);
  org.members[userId] = { userId, role, joinedAt: new Date().toISOString() };
  org.updatedAt = new Date().toISOString();
  pushLedger(store, { userId, kind: "organization_member_added", orgId, meta: { role } });
  return clone(org);
}
function grantToOrganization(store, orgId, amounts, meta = {}) {
  const org = mustOrg(store, orgId);
  const got = normalizeAmounts(amounts);
  for (const key of Object.keys(org.balances)) org.balances[key] = Number(org.balances[key] || 0) + Number(got[key] || 0);
  org.updatedAt = new Date().toISOString();
  pushLedger(store, { userId: meta.by || org.ownerId, kind: "organization_grant", orgId, amounts: got, balances: org.balances, meta });
  return clone(org);
}
function allocateToUser(store, orgId, userId, amounts, meta = {}) {
  const org = mustOrg(store, orgId);
  const got = normalizeAmounts(amounts);
  for (const key of Object.keys(org.balances)) org.balances[key] = Number(org.balances[key] || 0) - Number(got[key] || 0);
  const account = addCredits(store, userId, got, { kind: "organization_allocation", orgId, ...meta });
  org.updatedAt = new Date().toISOString();
  pushLedger(store, { userId, kind: "organization_allocated_to_user", orgId, amounts: got, balances: org.balances, meta });
  return { organization: clone(org), account };
}
function listOrganizations(store, userId) {
  return Object.values(store.perutaOrganizations || {}).filter(org => !userId || org.ownerId === userId || org.members?.[userId]).map(clone);
}
function organizationFor(store, orgId) { const org = (store.perutaOrganizations || {})[orgId]; return org ? clone(org) : null; }
function mustOrg(store, orgId) { const org = (store.perutaOrganizations || {})[orgId]; if (!org) throw new Error(`organization_not_found:${orgId}`); return org; }
function summary(store) { return { organizations: Object.values(store.perutaOrganizations || {}).map(clone), totals: totals(store) }; }
function totals(store) {
  const total = zeroWorldTotals();
  for (const org of Object.values(store.perutaOrganizations || {})) {
    const b = normalizeWorldTotals(org.balances);
    for (const key of Object.keys(total)) total[key] += b[key];
  }
  return total;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
module.exports = { addMember, allocateToUser, createOrganization, grantToOrganization, listOrganizations, organizationFor, summary };
