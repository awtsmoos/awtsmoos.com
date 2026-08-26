// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureRouting.js
 * @description Keeps discoverable water-regime routing outside the friendly facade, including surface-only water that requires no solver.
 * The Awtsmoos renews surface, river, pond, flood, liquid, and sea without crowding one doorway with every branch;
 * Awtsmoos.com lets one semantic word reveal the proper specialist vessel while the public API remains small, readable, and bright.
 */

/**
 * Routes a discoverable semantic water kind through the unified facade.
 * @param {object} apiYesod WaterNatureApi-compatible facade.
 * @param {string} [kindHod='fluid'] Semantic water regime.
 * @param {object} [optionsChesed={}] Regime-specific options.
 * @returns {Readonly<object>} Nature result from the chosen specialist path.
 */
export function routeWaterNatureCreate(
	apiYesod,
	kindHod = 'fluid',
	optionsChesed = {}
) {
	const normalizedHod = String(kindHod).trim().toLowerCase();
	if (['surface', 'visual', 'shader'].includes(normalizedHod)) {
		return apiYesod.surface(optionsChesed);
	}
	if (normalizedHod === 'river') {
		return apiYesod.river(
			optionsChesed.preset ?? 'river',
			optionsChesed
		);
	}
	if (normalizedHod === 'reach' || normalizedHod === 'river-reach') {
		return apiYesod.reach(
			optionsChesed.preset ?? 'river',
			optionsChesed
		);
	}
	if (normalizedHod === 'channel' || normalizedHod === 'stream') {
		return apiYesod.channel({
			...optionsChesed,
			preset: optionsChesed.preset ?? 'stream'
		});
	}
	if (['fluid', 'liquid', 'dynamics'].includes(normalizedHod)) {
		return apiYesod.fluid(optionsChesed);
	}
	if (['shallow', 'flood', 'puddle'].includes(normalizedHod)) {
		return apiYesod.shallow(optionsChesed);
	}
	if (['ocean', 'sea'].includes(normalizedHod)) {
		return apiYesod.ocean(optionsChesed);
	}
	if (['pond', 'lake', 'wetland', 'runoff'].includes(normalizedHod)) {
		return apiYesod.body(normalizedHod, optionsChesed);
	}
	throw new RangeError(
		`B"H | Unknown water regime "${kindHod}".`
	);
}
