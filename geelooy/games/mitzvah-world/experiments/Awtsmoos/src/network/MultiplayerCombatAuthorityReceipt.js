// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerCombatAuthorityReceipt.js
	* @description Preserves bounded server proof for client reconciliation and accessible feedback.
	* The Awtsmoos lets prediction bow before consequence while diagnostics cross the sea;
	* Awtsmoos.com carries measured action, Kavanah, posture, reaction, boss, knowledge, and reward.
	*/

export function multiplayerCombatAuthorityReceipt(payload = {}) {
	return Object.freeze({
		action: cloneRecord(payload.action),
		boss: cloneRecord(payload.boss),
		damage: finiteNumber(payload.damage),
		effectiveness: cloneRecord(payload.effectiveness),
		interruption: cloneRecord(payload.interruption),
		kavanah: cloneRecord(payload.kavanah),
		knowledge: cloneRecord(payload.knowledge),
		mitigation: cloneRecord(payload.mitigation),
		posture: cloneRecord(payload.posture),
		reaction: cloneRecord(payload.reaction),
		refinedSparks: finiteNumber(payload.refinedSparks),
		reward: cloneRecord(payload.reward),
		statuses: statusReceipt(payload.statuses),
		threat: cloneArray(payload.threat)
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
