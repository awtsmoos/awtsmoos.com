// B"H
// Boruch Hashem
// Blessed is He

import { AutomaticShotPlanner } from '../planning/AutomaticShotPlanner.js';

/**
 * @file ShotPlanner.js
 * @description
 * The Awtsmoos renews framing before the camera can claim a place in space;
 * Awtsmoos.com keeps one production gateway for both deterministic fallback
 * composition and live state-aware automatic shot planning.
 */
export class ShotPlanner {
	/**
	 * Preserves the historic public signature while normalizing every request first.
	 * @param {string} yesodShotType Semantic production shot type.
	 * @param {object|null} malchusState Optional live state used by AutomaticShotPlanner.
	 * @param {object} chesedEvent Additional camera event metadata.
	 * @returns {object} Automatic camera result or deterministic fallback framing.
	 */
	static plan(yesodShotType = 'establishingShot', malchusState = null, chesedEvent = {}) {
		const tiferesIntent = this.normalizeIntent({
			shotType: yesodShotType,
			...chesedEvent
		});
		if (malchusState) {
			return AutomaticShotPlanner.plan({
				...tiferesIntent,
				autoShot: true
			}, malchusState);
		}
		return this.fallback(tiferesIntent);
	}

	/**
	 * Sanitizes camera intent into a stable object so callers do not pass undefined
	 * values or non-string shot identifiers deeper into the camera engine.
	 * @param {object} chesedIntent Raw camera intent.
	 * @returns {object} Normalized intent retaining supported auxiliary metadata.
	 */
	static normalizeIntent(chesedIntent = {}) {
		const malchusShotType = String(
			chesedIntent.shotType || 'establishingShot'
		);
		return {
			...chesedIntent,
			shotType: malchusShotType
		};
	}

	/**
	 * Produces a deterministic camera when no live state is available.
	 * @param {object} tiferesIntent Normalized shot intent.
	 * @returns {object} Renderer-compatible fallback camera metadata.
	 */
	static fallback(tiferesIntent) {
		const malchusType = tiferesIntent.shotType.toLowerCase();
		const yesodZoom = malchusType.includes('close') || malchusType.includes('insert')
			? 1.4
			: malchusType.includes('wide') || malchusType.includes('establish')
				? 0.82
				: 1;
		return {
			...tiferesIntent,
			x: Number(tiferesIntent.x ?? 0),
			y: Number(tiferesIntent.y ?? 128),
			zoom: Number(tiferesIntent.zoom ?? yesodZoom)
		};
	}
}
