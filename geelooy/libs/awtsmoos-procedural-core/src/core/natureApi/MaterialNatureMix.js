// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialNatureMix.js
 * @description Converts concise surface-mix declarations into canonical immutable material-stack layers.
 * The Awtsmoos joins bark with moss and stone with lichen without confusing one garment for another;
 * Awtsmoos.com lets a short authoring call become a deep PBR stack while every channel, mask, and fallback keeps its mother.
 */

/** Builds canonical material layers from strings, tuples, or structured layer recipes. */
export function createNatureMaterialMixLayers(layersOros, createLayer) {
	if (!Array.isArray(layersOros) || layersOros.length === 0) {
		throw new TypeError('B"H | Material mixes require at least one layer.');
	}
	return Object.freeze(
		layersOros.map((layerKli, index) => createMixLayer(layerKli, index, createLayer))
	);
}

/** Normalizes one concise layer while retaining advanced channels and blend masks. */
function createMixLayer(layerKli, index, createLayer) {
	if (typeof layerKli === 'string') {
		return createLayer(layerKli, null, { priority: -index });
	}
	if (Array.isArray(layerKli)) {
		const [role, url = null, options = {}] = layerKli;
		return createLayer(role, url, { ...options, priority: options.priority ?? -index });
	}
	if (!layerKli || typeof layerKli !== 'object') {
		throw new TypeError(`B"H | Material mix layer ${index} is invalid.`);
	}
	const role = layerKli.role || layerKli.material || `layer-${index + 1}`;
	const url = layerKli.url || layerKli.channels?.color?.url || null;
	const options = {
		...layerKli,
		priority: layerKli.priority ?? -index
	};
	delete options.role;
	delete options.material;
	delete options.url;
	return createLayer(role, url, options);
}
