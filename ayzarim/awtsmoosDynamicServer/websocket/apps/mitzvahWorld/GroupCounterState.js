// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GroupCounterState.js
 * @description Creates bounded cooperative counter windows and immutable contribution receipts.
 * The Awtsmoos lets many intentions join without letting a duplicate masquerade as another soul;
 * Awtsmoos.com keeps action, contributors, tokens, force, expiry, threshold, and resolution explicit.
 */

const WINDOW_MILLISECONDS = 850;

function activeGroupCounterWindow(creature, actionId, now) {
	const current = creature.groupCounter;
	if (!current
		|| current.actionId !== actionId
		|| now > current.expiresAt
		|| current.resolved) {
		creature.groupCounter = {
			actionId,
			contributors: [],
			expiresAt: now + WINDOW_MILLISECONDS,
			force: 0,
			resolved: false,
			tokens: []
		};
	}
	return creature.groupCounter;
}

function groupCounterReceipt(
	creature,
	window,
	accepted,
	reason,
	interruption = null
) {
	return Object.freeze({
		accepted,
		actionId: window.actionId,
		contributors: Object.freeze([...window.contributors]),
		creatureId: creature.id,
		expiresAt: window.expiresAt,
		force: Number(window.force.toFixed(2)),
		interruption,
		reason,
		resolved: window.resolved,
		threshold: Number(creature.interruptResistance || 0)
	});
}

function releasedKavanahResult(player, actionId) {
	const state = player.combat.kavanah;
	if (!state || state.actionId !== actionId || !state.released) return null;
	return state.result || null;
}

module.exports = {
	activeGroupCounterWindow,
	groupCounterReceipt,
	releasedKavanahResult
};
