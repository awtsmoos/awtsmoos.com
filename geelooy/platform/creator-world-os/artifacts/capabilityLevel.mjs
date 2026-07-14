// B"H
// Boruch Hashem
// Blessed is He
/** @module CapabilityLevel @description Names what an artifact laboratory truly proved. */

export const CAPABILITY_LEVELS = Object.freeze([
	'inspected',
	'emulated',
	'simulated',
	'rendered',
	'unsupported'
]);

/** Creates one immutable capability claim with explicit evidence. */
export function createCapabilityLevel(input) {
	const level = String(input?.level || '').trim();
	const capability = String(input?.capability || '').trim();
	if (!CAPABILITY_LEVELS.includes(level) || !capability) {
		throw new TypeError('Capability claim requires supported level and capability.');
	}
	return Object.freeze({
		capability,
		level,
		evidence: Object.freeze([...(input?.evidence || [])]),
		limitations: Object.freeze([...(input?.limitations || [])]),
		verifiedAt: String(input?.verifiedAt || new Date().toISOString())
	});
}

/** Returns whether a claim represents successful execution rather than inspection. */
export function capabilityExecuted(claim) {
	return ['emulated', 'simulated', 'rendered'].includes(claim?.level);
}
