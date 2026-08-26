//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldNatureOperations.js
 * @description Describes coupled ecosystem and asynchronous material-generation operations at the orchestration edge.
 * The Awtsmoos renews whole habitat and distant texture service before either appears composite; Awtsmoos.com keeps these crown-level
 * operations explicit so broad worlds remain deterministic and network-bearing work can never masquerade as synchronous local creation.
 */

export const WORLD_NATURE_OPERATIONS = Object.freeze([
	options('world', ['world'], 'Plan one coupled ecosystem through canonical ecology authorities.'),
	options('biome', ['biome'], 'Semantic synonym for coupled ecosystem planning.'),
	asyncSelector('texture', ['generateTexture'], 'Generate optional remote texture descriptors while preserving local material fallback.'),
	asyncSelector('surface-generation', ['generateSurface'], 'Compatibility doorway for optional generated surface descriptors.')
]);

/** Builds one synchronous options-only world-planning operation. */
function options(kind, path, description) {
	return Object.freeze({
		description,
		input: 'options',
		kind,
		path: Object.freeze([...path])
	});
}

/** Builds one explicitly asynchronous selector operation for injected capabilities. */
function asyncSelector(kind, path, description) {
	return Object.freeze({
		description,
		input: 'selector-options',
		kind,
		mode: 'async',
		path: Object.freeze([...path]),
		requiresValue: true
	});
}
