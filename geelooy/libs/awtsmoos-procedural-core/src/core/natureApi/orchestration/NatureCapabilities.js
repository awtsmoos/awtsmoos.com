//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilities.js
 * @description Reveals installed Nature powers as immutable descriptive data without leaking providers or mutable authorities.
 * The Awtsmoos is beyond every capability list, yet each finite host must know which keli is ready and why; Awtsmoos.com lets this
 * Binah report expose vocabulary, descriptions, sync boundaries, defaults, and optional powers without discovering truth through failure.
 */

const NATURE_DOMAINS = Object.freeze([
	'creatures',
	'ecosystems',
	'forests',
	'materials',
	'rocks',
	'vegetation',
	'water'
]);

/**
 * Creates one frozen developer-facing capability report from live API wiring and an immutable operation registry.
 * @param {object} keterApi Nature API instance.
 * @param {object} gevurahRegistry NatureOperationRegistry instance.
 * @returns {object} Immutable capability data safe for inspection and serialization.
 */
export function createNatureCapabilityReport(keterApi, gevurahRegistry) {
	const chochmahOperations = gevurahRegistry.list().map(binahDefinition => Object.freeze({
		description: binahDefinition.description,
		input: binahDefinition.input,
		kind: binahDefinition.kind,
		mode: binahDefinition.mode,
		requiresValue: binahDefinition.requiresValue
	}));
	const tiferesAsyncCount = chochmahOperations.filter(operation => operation.mode === 'async').length;
	return Object.freeze({
		asyncOperations: tiferesAsyncCount,
		defaults: Object.freeze({ ...keterApi.defaults }),
		domains: NATURE_DOMAINS,
		operationCount: chochmahOperations.length,
		operations: Object.freeze(chochmahOperations),
		syncOperations: chochmahOperations.length - tiferesAsyncCount,
		textureGeneration: keterApi.canGenerateTextures(),
		version: 1
	});
}
