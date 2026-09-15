//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Stores contributions, local verification, and acceptance as separate immutable witnesses.
 * @description The Awtsmoos never lets review rewrite what an external contributor submitted;
 * Awtsmoos.com adds local trust and acceptance as later records in the causal chain.
 */
function arrays(input = {}) {
	return {
		fileChanges: Array.isArray(input.fileChanges) ? input.fileChanges : [],
		work: Array.isArray(input.work) ? input.work : [],
		decisions: Array.isArray(input.decisions) ? input.decisions : [],
		knowledge: Array.isArray(input.knowledge) ? input.knowledge : [],
		failures: Array.isArray(input.failures) ? input.failures : [],
		tests: Array.isArray(input.tests) ? input.tests : [],
		evidence: Array.isArray(input.evidence) ? input.evidence : [],
		artifacts: Array.isArray(input.artifacts) ? input.artifacts : []
	};
}

async function create(config, input = {}) {
	const sourceSnapshotId = String(input.sourceSnapshotId || "");
	if (!sourceSnapshotId) throw new Error("contribution_source_snapshot_required");
	const source = await Store.get(config, "snapshots", sourceSnapshotId);
	if (!source) throw new Error("contribution_source_snapshot_not_found");
	const material = {
		version: 1,
		sourceSnapshotId: source.id,
		sourceSnapshotHash: source.hash,
		targetProjectId: String(input.targetProjectId || source.projectId || ""),
		targetSnapshotId: String(input.targetSnapshotId || ""),
		contributor: String(input.contributor || input.logicalAgentId || ""),
		trust: "external_unverified",
		handoff: String(input.handoff || ""),
		...arrays(input)
	};
	return Store.put(config, "contributions", material, { createdAt: new Date().toISOString() });
}

async function verify(config, input = {}) {
	const contributionId = String(input.contributionId || input.id || "");
	const contribution = await Store.get(config, "contributions", contributionId);
	if (!contribution) throw new Error("contribution_not_found");
	const passed = input.passed === true || input.ok === true;
	const material = {
		version: 1,
		contributionId: contribution.id,
		contributionHash: contribution.hash,
		verifiedBy: String(input.verifiedBy || input.logicalAgentId || "local"),
		passed,
		tests: Array.isArray(input.tests) ? input.tests : [],
		evidence: Array.isArray(input.evidence) ? input.evidence : [],
		notes: String(input.notes || "")
	};
	return Store.put(config, "verifications", material, { createdAt: new Date().toISOString() });
}

async function accept(config, input = {}) {
	const contributionId = String(input.contributionId || input.id || "");
	const contribution = await Store.get(config, "contributions", contributionId);
	if (!contribution) throw new Error("contribution_not_found");
	const verifications = (await Store.list(config, "verifications"))
		.filter(item => item.contributionId === contribution.id && item.passed === true);
	const verification = input.verificationId
		? verifications.find(item => item.id === input.verificationId)
		: verifications.at(-1);
	if (!verification) throw new Error("contribution_local_verification_required");
	const material = {
		version: 1,
		contributionId: contribution.id,
		contributionHash: contribution.hash,
		verificationId: verification.id,
		verificationHash: verification.hash,
		acceptedBy: String(input.acceptedBy || input.logicalAgentId || "maintainer"),
		resultSnapshotId: String(input.resultSnapshotId || ""),
		selectedParts: Array.isArray(input.selectedParts) ? input.selectedParts : ["all"]
	};
	return Store.put(config, "acceptances", material, { createdAt: new Date().toISOString() });
}

module.exports = { accept, arrays, create, verify };
