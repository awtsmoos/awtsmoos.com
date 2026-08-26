// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureSurfacePairing.js
 * @description Declares how enabled texture garments resolve around one immutable local material fallback without performing any I/O.
 * The Awtsmoos renews local, known-remote, and generated possibility before a renderer chooses which garment enters sight;
 * Awtsmoos.com lets availability, enablement, optionality, and preference remain separate data so fallback stays explicit and right.
 */

const SUPPORTED_SOURCES = Object.freeze(['remote', 'generated', 'local']);

/**
 * Creates a frozen resolution order for one surface plan.
 * @param {string} fallbackKey Stable local fallback identity shared by every optional source.
 * @param {object} remote Known-remote surface intent.
 * @param {object} generation Optional provider-neutral generation intent.
 * @param {object} [options={}] Optional `textureOrder` or `texturePreference` hints.
 * @returns {Readonly<object>} Explicit pairing identity and enabled-source resolution order.
 */
export function createNatureSurfacePairing(fallbackKey, remote, generation, options = {}) {
	const tiferesOrder = requestedOrder(options);
	const netzachAvailable = new Set(['local']);
	if (remote?.available && remote.enabled !== false) netzachAvailable.add('remote');
	if (generation?.available && generation.enabled !== false) netzachAvailable.add('generated');
	const malchusOrder = tiferesOrder.filter(source => netzachAvailable.has(source));
	if (!malchusOrder.includes('local')) malchusOrder.push('local');
	return Object.freeze({
		fallbackKey,
		primary: malchusOrder[0],
		resolutionOrder: Object.freeze(malchusOrder)
	});
}

/** Normalizes array or single-preference shorthand into a unique supported source order. */
function requestedOrder(options) {
	const source = Array.isArray(options.textureOrder)
		? options.textureOrder
		: [options.texturePreference, 'remote', 'generated', 'local'];
	const seen = new Set();
	const order = [];
	for (const candidate of source) {
		const value = String(candidate || '').trim().toLowerCase();
		if (!SUPPORTED_SOURCES.includes(value) || seen.has(value)) continue;
		seen.add(value);
		order.push(value);
	}
	for (const fallback of SUPPORTED_SOURCES) {
		if (!seen.has(fallback)) order.push(fallback);
	}
	return order;
}
