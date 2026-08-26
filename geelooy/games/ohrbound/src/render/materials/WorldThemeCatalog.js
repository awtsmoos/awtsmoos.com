//B"H
//Boruch Hashem
//Blessed is He

import {
	awtsmoosMaterial,
	VERIFIED_TEXTURE_FILES as F
} from "./AwtsmoosTextureUrls.js";

/**
 * @file WorldThemeCatalog.js
 * @description Gives eight campaign worlds distinct Awtsmoos-hosted material and light identities.
 * The Awtsmoos is one beyond every hue while worlds unfold in many garments bright;
 * Awtsmoos.com lets each finite gate wear its own earth, metal, wood, and measured light.
 */
const material = (id, file, color, scale) =>
	awtsmoosMaterial(id, file, color, scale);

const THEMES = Object.freeze({
	Garden: {
		clear: [0.018, 0.045, 0.038, 1],
		ambient: [0.22, 0.34, 0.27],
		directional: [0.9, 0.98, 0.74],
		surface: material("garden-grass", F.grass, [0.42, 0.62, 0.34, 1], 1.35),
		oneWay: material("garden-earth", F.dirtGrass, [0.43, 0.34, 0.2, 1], 1.65),
		backdrop: material("garden-forest", F.forestFloor, [0.16, 0.24, 0.17, 1], 2.4)
	},
	Ascent: {
		clear: [0.028, 0.045, 0.065, 1],
		ambient: [0.25, 0.29, 0.35],
		directional: [0.9, 0.92, 0.98],
		surface: material("ascent-cobble", F.cobblestone, [0.48, 0.5, 0.53, 1], 1.55),
		oneWay: material("ascent-floor", F.stoneFloor, [0.58, 0.57, 0.55, 1], 1.8),
		backdrop: material("ascent-fieldstone", F.fieldstone, [0.24, 0.27, 0.3, 1], 2.2)
	},
	Wind: {
		clear: [0.025, 0.07, 0.105, 1],
		ambient: [0.28, 0.38, 0.5],
		directional: [0.78, 0.94, 1],
		surface: material("wind-stone", F.fieldstone, [0.5, 0.6, 0.64, 1], 1.7),
		oneWay: material("wind-granite", F.granite, [0.66, 0.7, 0.74, 1], 1.45),
		backdrop: material("wind-floor", F.stoneFloor, [0.2, 0.34, 0.44, 1], 2.6)
	},
	Machines: {
		clear: [0.06, 0.028, 0.022, 1],
		ambient: [0.32, 0.2, 0.16],
		directional: [1, 0.68, 0.38],
		surface: material("machines-iron", F.rustyIron, [0.48, 0.29, 0.22, 1], 1.25),
		oneWay: material("machines-copper", F.copper, [0.68, 0.38, 0.2, 1], 1.45),
		backdrop: material("machines-dark-iron", F.rustyIron, [0.22, 0.13, 0.12, 1], 2.4)
	},
	Prism: {
		clear: [0.034, 0.024, 0.078, 1],
		ambient: [0.32, 0.28, 0.5],
		directional: [0.82, 0.72, 1],
		surface: material("prism-granite", F.granite, [0.56, 0.5, 0.7, 1], 1.35),
		oneWay: material("prism-silver", F.silver, [0.72, 0.75, 0.86, 1], 1.55),
		backdrop: material("prism-shadow", F.silver, [0.22, 0.2, 0.38, 1], 2.8)
	},
	Chill: {
		clear: [0.014, 0.038, 0.052, 1],
		ambient: [0.18, 0.34, 0.38],
		directional: [0.64, 0.9, 0.86],
		surface: material("chill-floor", F.forestFloor, [0.2, 0.38, 0.32, 1], 1.8),
		oneWay: material("chill-grass", F.grass, [0.4, 0.62, 0.5, 1], 1.5),
		backdrop: material("chill-earth", F.dirt, [0.13, 0.22, 0.24, 1], 2.7)
	},
	Sanctuary: {
		clear: [0.062, 0.038, 0.018, 1],
		ambient: [0.4, 0.3, 0.18],
		directional: [1, 0.86, 0.48],
		surface: material("sanctuary-oak", F.oak, [0.5, 0.3, 0.15, 1], 1.35),
		oneWay: material("sanctuary-planks", F.planks, [0.64, 0.43, 0.22, 1], 1.5),
		backdrop: material("sanctuary-gold", F.gold, [0.34, 0.24, 0.08, 1], 2.8)
	},
	Gates: {
		clear: [0.012, 0.018, 0.045, 1],
		ambient: [0.22, 0.25, 0.42],
		directional: [1, 0.8, 0.34],
		surface: material("gates-floor", F.stoneFloor, [0.42, 0.45, 0.58, 1], 1.5),
		oneWay: material("gates-gold", F.gold, [0.72, 0.52, 0.16, 1], 1.7),
		backdrop: material("gates-cobble", F.cobblestone, [0.16, 0.18, 0.3, 1], 2.6)
	}
});

/** Resolves campaign or community pack names to a complete immutable world theme. */
export function worldThemeFor(pack) {
	const theme = THEMES[pack] || THEMES.Garden;
	return Object.freeze({ id: THEMES[pack] ? pack : "Garden", ...theme });
}

export const WORLD_THEME_NAMES = Object.freeze(Object.keys(THEMES));
