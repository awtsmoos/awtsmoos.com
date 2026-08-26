// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureRouting.js
 * @description Keeps semantic water regime routing outside the friendly WaterNatureApi class.
 * The Awtsmoos renews river, pond, flood, liquid, and sea without crowding one doorway with every branch;
 * Awtsmoos.com keeps routing law small so the public facade may stay simple while advanced engines freely expand their reach.
 */

/** Routes a discoverable semantic kind through the existing unified water facade. */
export function routeWaterNatureCreate(api, kind = 'fluid', options = {}) {
	const normalized = String(kind).trim().toLowerCase();
	if (normalized === 'river') {
		return api.river(options.preset ?? 'river', options);
	}
	if (normalized === 'reach' || normalized === 'river-reach') {
		return api.reach(options.preset ?? 'river', options);
	}
	if (normalized === 'channel' || normalized === 'stream') {
		return api.channel({ ...options, preset: options.preset ?? 'stream' });
	}
	if (['fluid', 'liquid', 'dynamics'].includes(normalized)) {
		return api.fluid(options);
	}
	if (['shallow', 'flood', 'puddle'].includes(normalized)) {
		return api.shallow(options);
	}
	if (['ocean', 'sea'].includes(normalized)) {
		return api.ocean(options);
	}
	if (['pond', 'lake', 'wetland', 'runoff'].includes(normalized)) {
		return api.body(normalized, options);
	}
	throw new RangeError(`B"H | Unknown water regime "${kind}".`);
}
