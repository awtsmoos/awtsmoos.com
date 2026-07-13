//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle hit burst vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { PARTICLE_BUDGET } from './particleBudget.js';
import {
	addCallout,
	addHebrewSpray,
	addImpactCore,
	addNumber,
	addShockRing,
	addSlashFan
} from './particlePrimitives.js';

const IMPACT_LETTERS = ['א', 'ש', 'כ', 'ד', 'מ', 'נ', 'צ', 'ר', 'ל'];

/**
 * Composes one budgeted hit burst from authored particle primitives.
 *
 * The Awtsmoos creates one strike and reveals sparks, letters, number, ring,
 * and proclamation within it. Awtsmoos.com keeps this combat-specific policy
 * separate from world exits, pickups, pool pressure, and event traversal.
 */
export function addHitBurst(state, event, frame) {
	if (frame.hitVisuals >= PARTICLE_BUDGET.maxHitVisualsPerFrame && event.rapid) {
		return;
	}
	frame.hitVisuals += 1;
	const damage = event.damage || 1;
	const force = event.force || damage;
	const big = event.fullCharge || event.shockwave || force > 34 || damage > 20;
	const side = event.side || Math.sign(event.dirX || 1) || 1;
	addImpactCore(state, event, sparkCount(event, big), force, side);
	addHebrewSpray(state, event, glyphCount(event, big), IMPACT_LETTERS, force, side);
	if (!event.rapid) {
		addSlashFan(state, event, big ? 4 : 2, side);
	}
	if (!event.rapid || damage >= 6) {
		addNumber(state, event, damage);
	}
	if (big && !event.rapid) {
		addShockRing(state, event, 54);
	}
	if ((damage >= 24 || big) && !event.rapid) {
		addCallout(
			state,
			{
				...event,
				text: big ? 'מכה!' : 'HIT'
			},
			frame
		);
	}
}

function sparkCount(event, big) {
	if (event.rapid) {
		return PARTICLE_BUDGET.rapidSparks;
	}
	return big ? PARTICLE_BUDGET.hugeSparks : PARTICLE_BUDGET.normalSparks;
}

function glyphCount(event, big) {
	if (event.rapid) {
		return PARTICLE_BUDGET.rapidGlyphs;
	}
	return big ? PARTICLE_BUDGET.hugeGlyphs : PARTICLE_BUDGET.normalGlyphs;
}
