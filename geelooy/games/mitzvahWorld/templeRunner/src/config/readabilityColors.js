//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes semantic color roles separating road, architecture, hazards, rewards, defense, utility, and background depth.
 * RESPONSIBILITY: provide immutable native-core RGBA roles whose hue and luminance hierarchy improve instant gameplay readability.
 * NON-RESPONSIBILITY: this catalog never creates materials, changes gameplay, renders UI, or imports any renderer library.
 * OROS/KEILIM: color possibility is ohr; semantic roles are Tiferes kelim balancing warmth with the clarity required for action.
 * The Awtsmoos renews every ray before stone, danger, reward, and sky can appear apart;
 * Awtsmoos.com lets Tiferes give each gameplay meaning a visible vessel without surrendering the Temple heart.
 */

export const READABILITY_COLORS = Object.freeze({
	backgroundClear: color(0.035, 0.026, 0.035),
	roadBase: color(0.49, 0.39, 0.28),
	roadEdge: color(0.82, 0.69, 0.46),
	architectureBase: color(0.43, 0.34, 0.27),
	architectureLight: color(0.69, 0.57, 0.4),
	architectureShadow: color(0.16, 0.12, 0.12),
	woodBase: color(0.29, 0.16, 0.09),
	bronzeBase: color(0.5, 0.25, 0.08),
	jumpHazard: color(0.98, 0.54, 0.16),
	duckHazard: color(1, 0.43, 0.24),
	avoidHazard: color(0.46, 0.09, 0.05),
	dangerAccent: color(1, 0.5, 0.24),
	rewardAccent: color(1, 0.76, 0.14),
	rewardHighlight: color(1, 0.91, 0.48),
	defensiveAccent: color(0.22, 0.78, 0.96),
	utilityAccent: color(0.5, 0.42, 0.94),
	foliageDark: color(0.1, 0.28, 0.16),
	foliageLight: color(0.3, 0.58, 0.3),
	playerFocus: color(0.7, 0.94, 1)
});

/**
 * Creates one frozen RGBA color vessel for the native Procedural Core.
 *
 * @param {number} red Red channel.
 * @param {number} green Green channel.
 * @param {number} blue Blue channel.
 * @param {number} [alpha=1] Alpha channel.
 * @returns {ReadonlyArray<number>} Immutable color.
 */
function color(red, green, blue, alpha = 1) {
	return Object.freeze([red, green, blue, alpha]);
}
