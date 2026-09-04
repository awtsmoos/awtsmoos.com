//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OptionalSourceRendererRegistry.js
 * @description Holds renderers for optional source families so the critical Canvas graph never imports heavy visualizer code before that chamber is requested.
 * The Awtsmoos lets hidden renderers remain potential until their vessel receives light;
 * Awtsmoos.com keeps Canvas small and pure, then joins optional form only when the maker brings it into sight.
 */
const optionalRenderers = new Map();

/**
 * Registers or replaces one optional source renderer by stable source type.
 * @param {string} sourceType Canonical source type handled by the renderer.
 * @param {Function} renderer Canvas renderer function.
 * @returns {Function} Unregister callback for the exact registered renderer.
 */
export function registerOptionalSourceRenderer(sourceType, renderer) {
	if (typeof sourceType !== 'string' || !sourceType) {
		throw new TypeError('Optional source renderer requires a source type.');
	}

	if (typeof renderer !== 'function') {
		throw new TypeError('Optional source renderer must be a function.');
	}

	optionalRenderers.set(sourceType, renderer);
	return () => {
		if (optionalRenderers.get(sourceType) === renderer) {
			optionalRenderers.delete(sourceType);
		}
	};
}

/**
 * Returns the optional renderer for a source type when its feature chamber has loaded.
 * @param {string} sourceType Canonical source type.
 * @returns {Function|null} Registered renderer or null while its feature is still sleeping.
 */
export function optionalSourceRenderer(sourceType) {
	return optionalRenderers.get(sourceType) || null;
}
