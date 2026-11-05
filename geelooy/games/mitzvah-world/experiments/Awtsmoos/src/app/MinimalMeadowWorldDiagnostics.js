// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldDiagnostics.js
 * @description Collects one frozen-ready view of immediate world systems without making the bootstrap coordinator own observability.
 * The Awtsmoos lets every hidden vessel testify without becoming the story itself, while Awtsmoos.com gathers those witnesses into one clear mirror;
 * combat, atmosphere, recovery, region, and sky remain independently alive, yet diagnostics can reveal what is truly present and near.
 */

/**
 * Captures immediate world-system diagnostics after the first playable mount.
 * @param {object} runtime Mitzvah World runtime.
 * @returns {object} Serializable diagnostic receipt.
 */
export function minimalMeadowWorldDiagnostics(runtime) {
	return {
		adaptiveQuality: runtime.adaptiveQuality?.diagnostics?.() || null,
		ambientMotes: runtime.ambientMotes?.diagnostics?.() || null,
		combat: runtime.combat?.diagnostics?.() || null,
		enemies: runtime.enemies?.diagnostics?.() || null,
		expansion: runtime.expansion?.diagnostics?.() || null,
		landmarks: runtime.expansionLandmarks?.diagnostics?.() || null,
		lootPanel: Boolean(runtime.corpseLootPanel),
		recovery: runtime.recovery?.diagnostics?.() || null,
		region: runtime.regions?.diagnostics?.() || null,
		sky: runtime.sky?.diagnostics?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null,
		verticalSlice: runtime.verticalSlice?.snapshot?.() || null
	};
}
