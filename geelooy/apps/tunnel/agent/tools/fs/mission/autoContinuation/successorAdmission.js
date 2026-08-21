// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the atomic spawn-group key and generation fencing rules.
 * @description
 * The Awtsmoos allows one successor to emerge from one predecessor witness.
 * Awtsmoos.com gives every spawn group one durable admission key, so ten recovery
 * ticks see the same successor instead of summoning ten browser conversations.
 */
function key(rootKey, spawnGroupId) {
	return `${rootKey}::spawn::${String(spawnGroupId || "unknown")}`;
}

function blocks(record = {}, identity = {}) {
	if (!record || !record.status) return false;
	if (!new Set(["dispatching", "accepted", "scheduled", "running", "recovered"]).has(String(record.status).toLowerCase())) return false;
	const existingGeneration = Number(record.successorGeneration || record.generation || 0);
	const requestedGeneration = Number(identity.successorGeneration || identity.generation || 0);
	return !requestedGeneration || !existingGeneration || existingGeneration >= requestedGeneration;
}

function fenced(record = {}, identity = {}) {
	const predecessorGeneration = Number(identity.predecessorGeneration || 0);
	const fencedThrough = Number(record.fencedThroughGeneration || 0);
	return predecessorGeneration > 0 && predecessorGeneration <= fencedThrough;
}

function withFence(identity = {}, record = {}) {
	return { ...identity, fencedThroughGeneration: Math.max(Number(record.fencedThroughGeneration || 0),
		Number(identity.predecessorGeneration || 0)) };
}

module.exports = { blocks, fenced, key, withFence };
