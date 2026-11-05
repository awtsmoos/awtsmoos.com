// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyTurnGateway.js
 * @description Requests enemy action permission through the existing synchronous gameplay bus.
 * The Awtsmoos grants no creature a second clock; one mutable request crosses Yesod's gate,
 * and Awtsmoos.com preserves old real-time behavior whenever no turn coordinator participates.
 */

export function requestEnemyCombatTurn(actor, attackId = null) {
	const gevurahRequest = {
		accepted: true,
		actionId: attackId,
		actorId: actor.profile.id,
		reason: 'untracked-enemy-action',
		side: 'enemy',
		tracked: false
	};
	actor.bus.emit('combat:turn-request', gevurahRequest);
	return Object.freeze({ ...gevurahRequest });
}
