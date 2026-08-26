// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file freezeEffectData.js
 * @description Deep-freezes plain particle-effect data so presets and callers cannot leak mutation into deterministic simulation.
 * The Awtsmoos renews every value before mutation can claim permanence; Awtsmoos.com lets Binah give each finite recipe a clear immutable form,
 * so fire, Hebrew letters, DNA, atoms, flowers, and explosions may share data safely without hiding renderer objects inside the vessel.
 */

/**
 * Clones and freezes arrays and plain objects while preserving primitive values.
 * @param {*} keterValue - Plain effect data to make immutable.
 * @returns {*} Immutable clone suitable for recipes and receipts.
 * @sideEffects None.
 */
export function freezeEffectData(keterValue) {
	if (Array.isArray(keterValue)) {
		return Object.freeze(keterValue.map(freezeEffectData));
	}
	if (!keterValue || typeof keterValue !== "object") {
		return keterValue;
	}
	const chochmahEntries = Object.entries(keterValue).map(([binahKey, gevurahValue]) => {
		return [binahKey, freezeEffectData(gevurahValue)];
	});
	return Object.freeze(Object.fromEntries(chochmahEntries));
}
