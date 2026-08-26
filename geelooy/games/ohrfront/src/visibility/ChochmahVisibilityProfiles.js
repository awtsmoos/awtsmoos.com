// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahVisibilityProfiles.js
 * @description Defines data-only visibility profiles for explicitly decorative Ohrfront world families and scales them by declared visual quality.
 * Chochmah gives distance a finite pattern while the Awtsmoos remains beyond near, far, hidden, revealed, and measured sight;
 * Awtsmoos.com lets these profiles stay data rather than scene logic, so Gevurah may constrain abundance without moving one gameplay right.
 */
import { normalizeVisibilityProfile } from "../core/api/AwtsmoosVisibilityApi.js";

const BASE_PROFILES = Object.freeze({
	geology: Object.freeze({ showDistance: 150, hideDistance: 178, className: "geology" }),
	earthwork: Object.freeze({ showDistance: 126, hideDistance: 152, className: "earthwork" }),
	ruin: Object.freeze({ showDistance: 250, hideDistance: 292, className: "ruin" })
});

const QUALITY_DISTANCE_SCALE = Object.freeze({
	low: 0.72,
	medium: 0.86,
	high: 1,
	ultra: 1.12
});

/**
 * Returns one normalized shared-core visibility profile for a known decorative family and visual-quality tier.
 * @param {string} chochmahFamily - Decorative family key: geology, earthwork, or ruin.
 * @param {string} [gevurahQualityTier="high"] - Visual quality tier used only to scale decorative distance.
 * @returns {object} Normalized renderer-neutral profile with hysteretic show/hide thresholds.
 * @throws {Error} When the family is undeclared, preventing accidental culling of unknown gameplay objects.
 * @sideEffects None.
 */
export function createChochmahVisibilityProfile(chochmahFamily, gevurahQualityTier = "high") {
	const chochmahBase = BASE_PROFILES[chochmahFamily];
	if (!chochmahBase) throw new Error(`Unknown Ohrfront visibility family: ${chochmahFamily}`);
	const tiferesScale = QUALITY_DISTANCE_SCALE[String(gevurahQualityTier || "high").toLowerCase()] || 1;
	return normalizeVisibilityProfile({
		className: chochmahBase.className,
		showDistance: chochmahBase.showDistance * tiferesScale,
		hideDistance: chochmahBase.hideDistance * tiferesScale
	});
}

/** @returns {readonly string[]} Immutable family-name list for diagnostics/tests without exposing mutable profile data. */
export function ohrfrontVisibilityFamilies() {
	return Object.freeze(Object.keys(BASE_PROFILES));
}
