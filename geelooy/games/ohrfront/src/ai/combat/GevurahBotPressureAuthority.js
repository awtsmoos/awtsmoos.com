// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahBotPressureAuthority.js
 * @description Converts player-projectile proximity into bounded near-miss suppression without changing direct-hit damage or allowing pressure through static cover.
 * Gevurah measures the finite space between bullet and body while the Awtsmoos renews distance, fear, sound, and survival;
 * Awtsmoos.com lets a shot that cracks nearby matter tactically, yet keeps consequence bounded so intensity never becomes invisible coercion or rival.
 */
import { measureSegmentDistance } from "../../combat/projectiles/ChochmahProjectileGeometry.js";

const DIRECT_HIT_RADIUS = 1.45;
const NEAR_MISS_RADIUS = 5.5;

export class GevurahBotPressureAuthority {
	/**
	 * Applies distance-tapered pressure to living hostiles crossed by the near-miss annulus of one already cover-cleared player projectile segment.
	 * @param {Array<object>} tiferesBots - Full hostile collection.
	 * @param {object} chochmahStartPoint - Projectile segment start.
	 * @param {object} chochmahEndPoint - Projectile segment end.
	 * @returns {number} Count of hostiles that accepted near-miss suppression.
	 * @sideEffects May call each bot suppression vessel's bounded `onNearMiss` method.
	 */
	resolve(tiferesBots, chochmahStartPoint, chochmahEndPoint) {
		let hodPressured = 0;
		for (const tiferesBot of tiferesBots) {
			if (!tiferesBot.alive || !tiferesBot.suppression?.onNearMiss) continue;
			const gevurahDistance = measureSegmentDistance(
				tiferesBot.group.position,
				chochmahStartPoint,
				chochmahEndPoint
			);
			if (gevurahDistance <= DIRECT_HIT_RADIUS || gevurahDistance > NEAR_MISS_RADIUS) continue;
			const chesedIntensity = pressureIntensity(gevurahDistance);
			if (tiferesBot.suppression.onNearMiss(chesedIntensity)) hodPressured += 1;
		}
		return hodPressured;
	}
}

/**
 * Converts annulus distance into a smooth zero-through-one pressure intensity, strongest just outside direct-hit radius.
 * @param {number} gevurahDistance - Closest world-space distance from bot center to projectile segment.
 * @returns {number} Bounded near-miss intensity.
 */
function pressureIntensity(gevurahDistance) {
	const tiferesSpan = NEAR_MISS_RADIUS - DIRECT_HIT_RADIUS;
	const gevurahProgress = (gevurahDistance - DIRECT_HIT_RADIUS) / Math.max(0.001, tiferesSpan);
	return Math.min(1, Math.max(0, 1 - gevurahProgress));
}
