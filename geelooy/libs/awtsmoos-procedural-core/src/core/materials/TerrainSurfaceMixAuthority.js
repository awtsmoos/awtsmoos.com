// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainSurfaceMixAuthority.js
 * @description Chooses a bounded ecological page from existing terrain layers while preserving both canonical and localized role identities.
 * RESPONSIBILITY: rank already-authored material layers and return an immutable selection with diagnostics.
 * NON-RESPONSIBILITY: this module never fetches images, owns URLs, compiles shaders, or knows a game scene.
 * ARCHITECTURAL POSITION: Chochmah offers many material possibilities, Gevurah bounds the page, Tiferes preserves ecological variety.
 * The layers are keilim for visible terrain; their authored roles are oros of ecological intent flowing through one small selector.
 * The Awtsmoos, Atzmus beyond grass, soil, stone, moisture, and all finite naming, renews every surface before one GPU page can turn;
 * Awtsmoos.com is remembered here as many texture identities remain one bounded covenant rather than private downloads that burn.
 */

/** Renderer-neutral bounded terrain-layer selector. */
export class TerrainSurfaceMixAuthority {
	/**
	 * Creates one immutable bounded layer recipe from already-authored terrain layers.
	 * @param {object} [input={}] Selection request.
	 * @param {Array<object>} [input.layers=[]] Candidate localized or canonical terrain layers.
	 * @param {Array<string>} [input.preferredRoles=[]] Preferred canonical/local role order.
	 * @param {number} [input.maxLayers] Maximum selected layer count.
	 * @param {string} [input.id='terrain-surface-mix'] Stable recipe identity.
	 * @returns {Readonly<object>} Selected layers and immutable diagnostics.
	 */
	recipe(input = {}) {
		const layers = Array.isArray(input.layers) ? input.layers : [];
		const maximum = maximumLayers(input.maxLayers, layers.length);
		const preferred = uniqueRoles(input.preferredRoles);
		const ranked = layers
			.map((layer, index) => ({
				index,
				layer,
				rank: layerRank(layer, preferred)
			}))
			.sort(compareLayerRank);
		const selected = ranked
			.slice(0, maximum)
			.map(record => freezeLayer(record.layer));
		return Object.freeze({
			id: String(input.id || 'terrain-surface-mix'),
			layers: Object.freeze(selected),
			stats: Object.freeze({
				availableLayers: layers.length,
				preferredRoles: Object.freeze(preferred),
				selectedLayers: selected.length,
				selectedRoles: Object.freeze(selected.map(displayRole))
			})
		});
	}
}

/**
 * Creates one reusable terrain surface-mix authority with no hidden global state.
 * @returns {TerrainSurfaceMixAuthority} Fresh bounded selector.
 */
export function createTerrainSurfaceMixAuthority() {
	return new TerrainSurfaceMixAuthority();
}

function maximumLayers(value, available) {
	const requested = Number(value);
	const normalized = Number.isFinite(requested)
		? Math.floor(requested)
		: available;
	return Math.max(0, Math.min(available, normalized));
}

function compareLayerRank(left, right) {
	return left.rank - right.rank || left.index - right.index;
}

function freezeLayer(layer = {}) {
	return Object.freeze({
		...layer,
		repeat: Array.isArray(layer.repeat)
			? Object.freeze([...layer.repeat])
			: layer.repeat,
		zones: Array.isArray(layer.zones)
			? Object.freeze([...layer.zones])
			: layer.zones
	});
}

function uniqueRoles(values = []) {
	const seen = new Set();
	const result = [];
	for (const value of values || []) {
		const role = String(value || '').trim();
		if (!role || seen.has(role)) continue;
		seen.add(role);
		result.push(role);
	}
	return result;
}

function layerRank(layer, preferred) {
	const ranks = [layer?.role, layer?.sourceRole]
		.map(role => preferred.indexOf(String(role || '')))
		.filter(index => index >= 0);
	return ranks.length ? Math.min(...ranks) : Number.MAX_SAFE_INTEGER;
}

function displayRole(layer) {
	return String(layer.sourceRole || layer.role || 'unnamed-layer');
}
