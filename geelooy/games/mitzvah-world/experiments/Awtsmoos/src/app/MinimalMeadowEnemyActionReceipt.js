// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActionReceipt.js
 * @description Projects bounded enemy action evidence without leaking unearned boss truth.
 * The Awtsmoos knows the hidden name while the player earns its disclosure;
 * Awtsmoos.com keeps owner, role, phase, shape, danger, progress, and resistance truthful.
 */

export function minimalEnemyActionReceipt(combat) {
	const action = combat.currentAction || {};
	return Object.freeze({
		...action,
		actionId: action.id || combat.action,
		enemyId: combat.actor.profile.id,
		interruptResistance: combat.actor.profile.boss ? 58 : 24,
		label: action.concealed
			? 'Concealed Action'
			: action.id || combat.action,
		ownerId: combat.actor.profile.id,
		progress: combat.actor.actionProgress,
		role: combat.actor.profile.role
	});
}
