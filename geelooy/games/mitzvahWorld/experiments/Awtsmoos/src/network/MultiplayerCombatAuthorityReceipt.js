// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerCombatAuthorityReceipt.js
 * @description Preserves bounded server combat proof for client reconciliation and readable feedback.
 * The Awtsmoos lets prediction bow before consequence while diagnostics cross the sea;
 * Awtsmoos.com carries only measured authority, so no client multiplier claims the decree.
 */

export function multiplayerCombatAuthorityReceipt(payload = {}) {
	return Object.freeze({
		action: cloneRecord(payload.action),
		damage: finiteNumber(payload.damage),
		effectiveness: cloneRecord(payload.effectiveness),
		mitigation: cloneRecord(payload.mitigation),
		refinedSparks: finiteNumber(payload.refinedSparks),
		statuses: statusReceipt(payload.statuses)
	});
}

function statusReceipt(statuses = {}) {
	return Object.freeze({
		applied: cloneArray(statuses.applied),
		current: cloneArray(statuses.current),
		removed: cloneArray(statuses.removed)
	});
}

function cloneArray(value) {
	return Object.freeze(Array.isArray(value)
		? value.map(cloneValue)
		: []);
}

function cloneRecord(value) {
	if (!value || typeof value !== 'object') return null;
	return Object.freeze(cloneValue(value));
}

function cloneValue(value) {
	return JSON.parse(JSON.stringify(value));
}

function finiteNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
