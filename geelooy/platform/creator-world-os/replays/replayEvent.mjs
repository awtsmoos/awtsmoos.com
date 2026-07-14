// B"H
// Boruch Hashem
// Blessed is He
/** @module ReplayEvent @description Records ordered deterministic player and world events. */

/** Creates one replay event with strict sequence identity. */
export function createReplayEvent(input) {
	const sequence = Number(input?.sequence);
	const type = String(input?.type || '').trim();
	if (!Number.isInteger(sequence) || sequence < 0 || !type) {
		throw new TypeError('Replay event requires nonnegative sequence and type.');
	}
	return Object.freeze({
		sequence,
		timeMs: Math.max(0, Number(input?.timeMs || 0)),
		type,
		actorId: input?.actorId || null,
		payload: Object.freeze({ ...(input?.payload || {}) }),
		checksum: String(input?.checksum || '')
	});
}

/** Sorts events and rejects duplicate sequence numbers. */
export function orderReplayEvents(events) {
	const ordered = [...events].sort((left, right) => left.sequence - right.sequence);
	const sequences = ordered.map(event => event.sequence);
	if (new Set(sequences).size !== sequences.length) {
		throw new TypeError('Replay events contain duplicate sequence numbers.');
	}
	return Object.freeze(ordered);
}
