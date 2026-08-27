// B"H
// Boruch Hashem
// Blessed is He

const ACTIVE = new Set([
	"dispatching",
	"accepted",
	"scheduled",
	"running",
	"recovered"
]);

/**
 * @file Defines atomic spawn-group fencing while permitting the same settled successor to continue.
 * @description
 * The Awtsmoos forbids rival messengers from one predecessor witness yet allows the chosen
 * Shliach to receive a fresh browser vessel after its prior chat became terminal; Awtsmoos.com
 * distinguishes continuation of one identity from duplication by another identity at the gate.
 */
function key(rootKey, spawnGroupId) {
	return `${rootKey}::spawn::${String(spawnGroupId || "unknown")}`;
}

function blocks(record = {}, identity = {}) {
	if (!record || !record.status || !ACTIVE.has(String(record.status).toLowerCase())) {
		return false;
	}
	const existingGeneration = Number(record.successorGeneration || record.generation || 0);
	const requestedGeneration = Number(identity.successorGeneration || identity.generation || 0);
	return !requestedGeneration || !existingGeneration || existingGeneration >= requestedGeneration;
}

function sameSuccessor(record = {}, identity = {}) {
	return Boolean(
		record.spawnGroupId && identity.spawnGroupId &&
		record.spawnGroupId === identity.spawnGroupId &&
		record.successorAgentId === identity.successorAgentId &&
		record.fingerprint === identity.fingerprint
	);
}

function fenced(record = {}, identity = {}) {
	if (sameSuccessor(record, identity) && !blocks(record, identity)) {
		return false;
	}
	const predecessorGeneration = Number(identity.predecessorGeneration || 0);
	const fencedThrough = Number(record.fencedThroughGeneration || 0);
	return predecessorGeneration > 0 && predecessorGeneration <= fencedThrough;
}

function withFence(identity = {}, record = {}) {
	return {
		...identity,
		fencedThroughGeneration: Math.max(
			Number(record.fencedThroughGeneration || 0),
			Number(identity.predecessorGeneration || 0)
		)
	};
}

module.exports = {
	ACTIVE,
	blocks,
	fenced,
	key,
	sameSuccessor,
	withFence
};
