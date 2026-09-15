//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");
const Roles = require("./roles.js");

/**
 * @file Stores immutable capability grants and additive revocations for Project collaboration.
 * @description The Awtsmoos grants explicit verbs, not mystical titles; Awtsmoos.com preserves
 * who granted what scope, when it expires, and every later revocation without rewriting history.
 */
async function grant(config, input = {}) {
	const subject = String(input.subject || input.principal || "");
	if (!subject) throw new Error("grant_subject_required");
	const role = input.role ? Roles.get(input.role) : null;
	const capabilities = unique(role?.capabilities || input.capabilities || []);
	if (!capabilities.length) throw new Error("grant_capabilities_required");
	return Store.put(config, "grants", {
		schemaVersion: 1,
		subject,
		role: role?.role || "custom",
		capabilities,
		scope: String(input.scope || "project:*"),
		expiresAt: input.expiresAt || null,
		grantedBy: String(input.grantedBy || input.logicalAgentId || "local:owner")
	}, { createdAt: new Date().toISOString() });
}

async function revoke(config, input = {}) {
	const grantId = String(input.grantId || input.id || "");
	const existing = await Store.get(config, "grants", grantId);
	if (!existing) throw new Error("grant_not_found");
	return Store.put(config, "grant_revocations", {
		schemaVersion: 1,
		grantId: existing.id,
		grantHash: existing.hash,
		revokedBy: String(input.revokedBy || input.logicalAgentId || "local:owner"),
		reason: String(input.reason || "")
	}, { createdAt: new Date().toISOString() });
}

async function active(config, subject, now = Date.now()) {
	const revoked = new Set((await Store.list(config, "grant_revocations")).map(item => item.grantId));
	return (await Store.list(config, "grants")).filter(item => {
		return item.subject === subject
			&& !revoked.has(item.id)
			&& (!item.expiresAt || Date.parse(item.expiresAt) > now);
	});
}

function unique(values) {
	return [...new Set((Array.isArray(values) ? values : []).map(value => String(value)).filter(Boolean))];
}

module.exports = { active, grant, revoke, unique };
