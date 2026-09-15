//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Compares immutable workspace snapshots or contribution envelopes by stable identifiers.
 * @description The Awtsmoos lets change appear across files, work, meaning, and evidence; this
 * projection reports additions/removals without pretending a textual diff is the whole causal story.
 */
function keyed(items = [], key = item => item?.id || "") {
	return new Map(items.filter(Boolean).map(item => [key(item), item]));
}

function delta(leftItems = [], rightItems = [], key) {
	const left = keyed(leftItems, key);
	const right = keyed(rightItems, key);
	return {
		added: [...right.keys()].filter(id => !left.has(id)).map(id => right.get(id)),
		removed: [...left.keys()].filter(id => !right.has(id)).map(id => left.get(id)),
		shared: [...right.keys()].filter(id => left.has(id))
	};
}

function snapshots(left, right) {
	return {
		left: { id: left.id, hash: left.hash, projectId: left.projectId },
		right: { id: right.id, hash: right.hash, projectId: right.projectId },
		work: delta(left.work, right.work, item => item.id),
		knowledge: delta(left.knowledge, right.knowledge, item => item.id),
		obligations: delta(left.obligations, right.obligations, item => item.obligationId),
		sources: delta(
			left.compiler?.sources,
			right.compiler?.sources,
			item => `${item.id}:${item.contentHash}`
		),
		compilerChanged: left.compiler?.hash !== right.compiler?.hash
	};
}

async function compareSnapshots(config, input = {}) {
	const left = await Store.get(config, "snapshots", input.leftSnapshotId || input.leftId);
	const right = await Store.get(config, "snapshots", input.rightSnapshotId || input.rightId);
	if (!left || !right) throw new Error("snapshot_compare_operand_missing");
	return snapshots(left, right);
}

async function compareContribution(config, input = {}) {
	const contribution = await Store.get(config, "contributions", input.contributionId || input.id);
	if (!contribution) throw new Error("contribution_not_found");
	const source = await Store.get(config, "snapshots", contribution.sourceSnapshotId);
	const target = contribution.targetSnapshotId
		? await Store.get(config, "snapshots", contribution.targetSnapshotId)
		: null;
	return {
		contributionId: contribution.id,
		trust: contribution.trust,
		fileChanges: contribution.fileChanges || [],
		work: contribution.work || [],
		decisions: contribution.decisions || [],
		failures: contribution.failures || [],
		tests: contribution.tests || [],
		sourceSnapshot: source ? { id: source.id, hash: source.hash } : null,
		targetSnapshot: target ? { id: target.id, hash: target.hash } : null,
		baseComparison: source && target ? snapshots(source, target) : null
	};
}

module.exports = { compareContribution, compareSnapshots, delta, keyed, snapshots };
