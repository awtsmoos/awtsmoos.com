// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeSeasonalProfile.js
 * @description Converts existing tree season intent into deterministic renderer-neutral visibility and material guidance without advancing time.
 * The Awtsmoos renews spring and winter as finite garments around one unchanged tree;
 * Awtsmoos.com lets color, leaf presence, and reproductive emphasis vary while skeleton identity remains free.
 */

const SEASONS = Object.freeze({
	autumn: Object.freeze({ leafVisibility: 0.72, leafTint: [0.88, 0.52, 0.18], reproductiveEmphasis: 1.18 }),
	evergreen: Object.freeze({ leafVisibility: 1, leafTint: [0.82, 1, 0.82], reproductiveEmphasis: 0.72 }),
	spring: Object.freeze({ leafVisibility: 0.86, leafTint: [0.72, 1.08, 0.72], reproductiveEmphasis: 1.2 }),
	summer: Object.freeze({ leafVisibility: 1, leafTint: [0.92, 1.02, 0.9], reproductiveEmphasis: 1 }),
	winter: Object.freeze({ leafVisibility: 0.08, leafTint: [0.72, 0.68, 0.58], reproductiveEmphasis: 0.22 })
});

/** Creates one frozen seasonal rendering profile from canonical environmental intent. */
export function createTreeSeasonalProfile(environment = {}, options = {}) {
	const season = SEASONS[environment?.season] ? environment.season : "evergreen";
	const base = SEASONS[season];
	const evergreen = options.evergreen === true;
	return Object.freeze({
		leafRoughnessScale: season === "winter" ? 1.16 : season === "autumn" ? 1.08 : 1,
		leafTint: Object.freeze([...base.leafTint]),
		leafVisibility: evergreen ? 1 : base.leafVisibility,
		reproductiveEmphasis: base.reproductiveEmphasis,
		season,
		wind: environment?.wind || null
	});
}
