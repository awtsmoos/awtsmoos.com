// B"H
// Boruch Hashem
// Blessed is He
/** @module QuarantineRecord @description Isolates stubborn workers with complete evidence. */

/** Creates an immutable worker quarantine record. */
export function createQuarantineRecord(input) {
	const workerId = String(input?.workerId || '').trim();
	const reason = String(input?.reason || '').trim();
	if (!workerId || !reason) {
		throw new TypeError('Quarantine record requires workerId and reason.');
	}
	return Object.freeze({
		workerId,
		jobId: input?.jobId || null,
		reason,
		processIdentity: Object.freeze({ ...(input?.processIdentity || {}) }),
		logs: Object.freeze([...(input?.logs || [])]),
		artifacts: Object.freeze([...(input?.artifacts || [])]),
		state: 'quarantined',
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}
