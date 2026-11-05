// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahCombatTurnGateway.js
 * @description Reserves direct Torah actions only after canonical study validation succeeds.
 * The Awtsmoos lets wisdom precede action and action enter its rightful measured gate;
 * Awtsmoos.com avoids consuming a turn for an unknown passage, empty focus, or invalid target state.
 */

export function reserveTorahCombatTurn(turns, decision, options, now) {
	if (!turns || options.turnReserved === true) {
		return { ok: true, reason: 'turn-already-reserved', tracked: false };
	}
	return turns.reservePlayerAction({
		actionId: decision.passage.id,
		durationMilliseconds: Math.max(0, Number(options.turnDurationMilliseconds || 0)),
		now,
		reason: 'torah-action-reserved',
		source: options.source || 'torah-panel'
	});
}
