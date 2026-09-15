//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Hash = require("../../../tools/fs/hashWrite.js");
const Store = require("./recordStore.js");

/**
 * @file Applies locally accepted Contribution files only through transactional hash guards.
 * @description The Awtsmoos never lets review become a blind overwrite; Awtsmoos.com proves the
 * immutable proposal, local verification, acceptance, selected paths, base hashes, and new bytes.
 */
async function apply(config, input = {}) {
	const contribution = await required(config, "contributions", input.contributionId, "contribution");
	const acceptance = await acceptanceFor(config, contribution, input.acceptanceId);
	const verification = await required(
		config,
		"verifications",
		acceptance.verificationId,
		"verification"
	);
	if (verification.passed !== true || verification.contributionId !== contribution.id) {
		throw new Error("contribution_local_verification_required");
	}
	const writes = validateWrites(contribution, acceptance, input.writes || input.changes || []);
	const transaction = await Hash.bulkWriteIfHashes(config, { writes });
	if (!transaction?.ok) return { ...transaction, contributionId: contribution.id, acceptanceId: acceptance.id };
	const application = await Store.put(config, "applications", {
		schemaVersion: 1,
		contributionId: contribution.id,
		contributionHash: contribution.hash,
		acceptanceId: acceptance.id,
		acceptanceHash: acceptance.hash,
		verificationId: verification.id,
		paths: writes.map(item => item.path),
		beforeHashes: Object.fromEntries(writes.map(item => [item.path, item.expectedSha256])),
		afterHashes: Object.fromEntries(writes.map(item => [item.path, sha256(item.content)])),
		appliedBy: String(input.appliedBy || input.logicalAgentId || "local:owner")
	}, { createdAt: new Date().toISOString() });
	return { ...transaction, application };
}

async function acceptanceFor(config, contribution, acceptanceId = "") {
	const all = (await Store.list(config, "acceptances"))
		.filter(item => item.contributionId === contribution.id);
	const found = acceptanceId
		? all.find(item => item.id === acceptanceId)
		: all.at(-1);
	if (!found) throw new Error("contribution_acceptance_required");
	return found;
}

async function required(config, kind, id, label) {
	const value = await Store.get(config, kind, String(id || ""));
	if (!value) throw new Error(`${label}_not_found`);
	return value;
}

function validateWrites(contribution, acceptance, writes) {
	if (!Array.isArray(writes) || !writes.length) throw new Error("contribution_writes_required");
	const proposed = new Map((contribution.fileChanges || []).map(change => [String(change.path || ""), change]));
	const selected = new Set((acceptance.selectedParts || ["all"]).map(String));
	return writes.map(write => {
		const path = String(write.path || "");
		const change = proposed.get(path);
		if (!path || !change) throw new Error(`contribution_path_not_proposed:${path}`);
		if (!selected.has("all") && !selected.has(path) && !selected.has(String(change.id || ""))) {
			throw new Error(`contribution_path_not_accepted:${path}`);
		}
		const expected = String(change.expectedSha256 || change.baseSha256 || change.beforeSha256 || "").toLowerCase();
		if (!expected) throw new Error(`contribution_base_hash_required:${path}`);
		if (String(write.expectedSha256 || "").toLowerCase() !== expected) {
			throw new Error(`contribution_base_hash_mismatch:${path}`);
		}
		const content = String(write.content ?? "");
		if (change.content !== undefined && content !== String(change.content)) {
			throw new Error(`contribution_content_mismatch:${path}`);
		}
		const after = String(change.afterSha256 || "").toLowerCase();
		if (after && sha256(content) !== after) throw new Error(`contribution_after_hash_mismatch:${path}`);
		return { path, content, expectedSha256: expected };
	});
}

function sha256(value) {
	return crypto.createHash("sha256").update(String(value)).digest("hex");
}

module.exports = { acceptanceFor, apply, sha256, validateWrites };
