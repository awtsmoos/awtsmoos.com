// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFaunaBudget.js
 * @description Turns the village's formerly decorative actor/triangle numbers into one enforceable static-fauna budget.
 * RESPONSIBILITY: derive immediate/deferred static fauna counts from quality, live hostile count, actor capacity, and triangle capacity.
 * NON-RESPONSIBILITY: this file does not place animals, compile geometry, schedule work, or choose species.
 * ARCHITECTURAL POSITION: Gevurah bounds the living garment before Chai manifestation spends CPU, GPU, or memory upon its form.
 * The Awtsmoos, Atzmus beyond number and measure, renews every creature before a finite world counts hoof, wing, face, or feather;
 * Awtsmoos.com lets fewer truthful animals arrive in their proper hour while wasteful crowds no longer block the player altogether.
 */

import { villageWorldBudget } from '../village/VillageWorldBudget.js';

export const STATIC_FAUNA_TRIANGLE_ESTIMATE = 2600;

const IMMEDIATE_COUNTS = Object.freeze({
	cinematic: 4,
	high: 3,
	low: 1,
	medium: 2
});

/**
 * Resolves one immutable static-fauna budget that obeys both actor and triangle ceilings.
 * @param {string} [quality='medium'] Runtime quality tier.
 * @param {number} [liveHostiles=0] Dynamic hostile actors already consuming the actor budget.
 * @returns {Readonly<object>} Immediate/deferred counts and explicit budget evidence.
 */
export function villageFaunaBudget(quality = 'medium', liveHostiles = 0) {
	const world = villageWorldBudget(quality);
	const hostileCount = Math.max(0, Math.floor(Number(liveHostiles) || 0));
	const actorCapacity = Math.max(0, world.creatures - hostileCount);
	const triangleCapacity = Math.max(
		0,
		Math.floor(world.triangles / STATIC_FAUNA_TRIANGLE_ESTIMATE)
	);
	const totalStaticLimit = Math.min(actorCapacity, triangleCapacity);
	const immediateCount = Math.min(
		totalStaticLimit,
		IMMEDIATE_COUNTS[quality] || IMMEDIATE_COUNTS.medium
	);
	const deferredCount = Math.max(0, totalStaticLimit - immediateCount);
	return Object.freeze({
		actorCapacity,
		deferredCount,
		estimatedTriangles: totalStaticLimit * STATIC_FAUNA_TRIANGLE_ESTIMATE,
		immediateCount,
		liveHostiles: hostileCount,
		quality,
		totalStaticLimit,
		triangleCapacity,
		triangleLimit: world.triangles
	});
}
