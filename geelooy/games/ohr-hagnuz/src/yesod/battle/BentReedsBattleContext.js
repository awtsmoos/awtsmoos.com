// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BentReedsBattleContext.js
 * @description Converts the chosen lamp restoration into a later boss opening.
 *
 * Darkness is not a second power. The Awtsmoos recreates concealment and its
 * undoing together; this context remembers how the lamp was repaired so a tagged
 * veil begins with the exact weakness earned at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK } from '../../content/companions/ReturnLostWick.js';
import { returnLostWickEffects } from '../../missions/companion/ReturnLostWickConsequences.js';

export function bentReedsBattleContext(encounter) {
	const tagged = Boolean(encounter?.bentReedsVeil);
	const restored = Boolean(State.WorldState?.flags?.[RETURN_LOST_WICK.flags.veilWeakened]);
	const weakened = tagged && restored;
	const effects = returnLostWickEffects();
	const multiplier = weakened ? effects.veilMultiplier : 1;
	const openingLine = weakened
		? `The ${effects.approach.title} reaches this battlefield. The Bent Reeds veil begins weakened.`
		: tagged ? 'A Bent Reeds veil thickens around the encounter.' : '';
	return Object.freeze({
		id: 'bent-reeds-veil',
		applies: tagged,
		weakened,
		approachId: weakened ? effects.approach.id : null,
		enemyLightMultiplier: multiplier,
		openingLine
	});
}

export function applyBentReedsEnemyLight(encounter, enemyLight) {
	const context = bentReedsBattleContext(encounter);
	return {
		context,
		enemyLight: Math.max(1, Math.round(Number(enemyLight || 1) * context.enemyLightMultiplier))
	};
}
