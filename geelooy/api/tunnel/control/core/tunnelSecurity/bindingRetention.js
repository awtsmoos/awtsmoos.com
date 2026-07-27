// B"H
// Boruch Hashem
// Blessed is He

const Audit = require("./audit.js");
const Policy = require("./bindingRetentionPolicy.js");

/**
	* @file Plans and performs guarded cleanup of old superseded tunnel bindings.
	* @description
	* The Awtsmoos keeps current authority, active grants, pins, recent history, and
	* a separate bounded generic audit tail. Protected records never consume that tail.
	*/
function plan(store = {}, input = {}) {
	const policy = Policy.options(input);
	const grants = Object.values(store.tunnelGrants || {});
	const groups = groupBindings(store.tunnelBindings || {}, policy.accountId);
	const candidates = [];
	const retained = [];
	for (const bindings of groups.values()) {
		const ordered = bindings.sort(compareRecent);
		let auditTailKept = 0;
		for (const binding of ordered) {
			const reason = retentionReason(binding, grants, policy, auditTailKept);
			if (reason === "candidate") {
				candidates.push(publicCandidate(binding, policy));
				continue;
			}
			if (reason === "audit_tail") auditTailKept += 1;
			retained.push({ tunnelId: binding.tunnelId, reason });
		}
	}
	return { candidates, retained, policy };
}

function pruneStore(store = {}, input = {}) {
	const planned = plan(store, input);
	const removed = [];
	for (const candidate of planned.candidates) {
		const binding = store.tunnelBindings?.[candidate.tunnelId];
		if (!binding) continue;
		delete store.tunnelBindings[candidate.tunnelId];
		removeInactiveGrants(store, candidate.tunnelId, planned.policy.atMs);
		Audit.appendAudit(store, {
			action: "binding.prune",
			accountId: binding.ownerAccountId,
			deviceId: binding.deviceId,
			tunnelId: binding.tunnelId,
			result: "allowed",
			reason: candidate.reason
		});
		removed.push(candidate);
	}
	return { ...planned, removed };
}

function retentionReason(binding, grants, policy, auditTailKept) {
	if (!isHistorical(binding)) return "current_authority";
	if (Policy.isPinned(binding, policy.atMs)) return "pinned";
	if (hasActiveGrant(binding.tunnelId, grants, policy.atMs)) return "active_grant";
	const ageMs = policy.atMs - Policy.terminalAt(binding);
	if (ageMs < policy.retentionMs) return "recent_history";
	if (auditTailKept < policy.historyPerIdentity) return "audit_tail";
	return "candidate";
}

function groupBindings(bindings, accountId) {
	const groups = new Map();
	for (const binding of Object.values(bindings)) {
		if (accountId && binding.ownerAccountId !== accountId) continue;
		const key = Policy.identityKey(binding);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(binding);
	}
	return groups;
}

function hasActiveGrant(tunnelId, grants, atMs) {
	return grants.some(grant => grant.tunnelId === tunnelId &&
		!grant.revokedAt &&
		(!grant.expiresAt || Number(grant.expiresAt) > atMs));
}

function removeInactiveGrants(store, tunnelId, atMs) {
	for (const [grantId, grant] of Object.entries(store.tunnelGrants || {})) {
		if (grant.tunnelId !== tunnelId) continue;
		if (!grant.revokedAt && (!grant.expiresAt || Number(grant.expiresAt) > atMs)) continue;
		delete store.tunnelGrants[grantId];
	}
}

function isHistorical(binding = {}) {
	return Boolean(binding.revokedAt || binding.supersededAt || binding.supersededBy);
}

function compareRecent(left, right) {
	return Policy.terminalAt(right) - Policy.terminalAt(left);
}

function publicCandidate(binding, policy) {
	return {
		tunnelId: binding.tunnelId,
		ownerAccountId: binding.ownerAccountId,
		deviceId: binding.deviceId,
		tunnelName: binding.tunnelName,
		terminalAt: new Date(Policy.terminalAt(binding)).toISOString(),
		ageMs: policy.atMs - Policy.terminalAt(binding),
		reason: binding.supersededBy ? "superseded_expired" : "revoked_expired"
	};
}

module.exports = { groupBindings, plan, pruneStore, retentionReason };
