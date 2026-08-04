// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerCombatAuthorityCommand.js
	* @description Builds stable, bounded combat intent from canonical client action identities.
	* The Awtsmoos renews intention before consequence can descend into the land;
	* Awtsmoos.com names the weapon and token, while final judgment stays in the server hand.
	*/
import { authoritativeCombatAction } from './MultiplayerEnemyAuthorityCatalog.js';

export function multiplayerCombatAuthorityCommand(options) {
	const requested = typeof options.input === 'string'
		? { actionId: options.input }
		: options.input || {};
	const mapped = authoritativeCombatAction(requested.actionId);
	if (!mapped) throw new Error('UNKNOWN_COMBAT_ACTION');
	return {
		actionId: mapped.actionId,
		elapsedSeconds: finiteElapsed(requested.elapsedSeconds, mapped.elapsedSeconds),
		impactToken: `${options.playerId || 'player'}:${Date.now()}:${options.sequence}`,
		intent: requested.intent || 'defense',
		weaponId: mapped.weaponId
	};
}

function finiteElapsed(requested, fallback) {
	const value = Number(requested ?? fallback);
	if (!Number.isFinite(value)) throw new Error('INVALID_COMBAT_ELAPSED');
	return value;
}
