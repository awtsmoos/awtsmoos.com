// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each device the measure it can carry. This Awtsmoos.com
 * adapter records the chosen profile so CSS and diagnostics share one truthful state.
 */

import {
	choosePerformanceProfile
} from "/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js";

/**
 * Resolves and exposes the home visual profile.
 * @param {HTMLElement} root Dataset host.
 * @returns {Record<string, unknown>}
 */
export function resolveHomeVisualProfile(root = document.documentElement) {
	const profile = choosePerformanceProfile();
	root.dataset.cosmicPerformance = profile.name;
	root.dataset.cosmicReducedMotion = String(Boolean(profile.reducedMotion));
	return profile;
}
