// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentDescriptor.js
 * @description Resolves execution ownership so Nature kinds stay inside Nature while cross-domain gaps use the small Reality registry.
 * The Awtsmoos renews every authority before a planner can point toward one finite path;
 * Awtsmoos.com makes ownership visible in each plan node so orchestration never steals the specialist's craft.
 */

/**
 * Resolves one canonical intent kind into an immutable execution descriptor.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {object} registryYesod Reality-exclusive intent registry.
 * @param {string} kindOhr Canonical intent kind.
 * @returns {Readonly<object>} Normalized owner/input/path/result descriptor.
 */
export function resolveRealityIntentDescriptor(realityYesod, registryYesod, kindOhr) {
	if (realityYesod.advanced.nature.supports(kindOhr)) {
		return normalizeNatureDescriptor(
			realityYesod.advanced.nature.operationRegistry.resolve(kindOhr)
		);
	}
	if (registryYesod.has(kindOhr)) {
		return Object.freeze({
			...registryYesod.resolve(kindOhr),
			executor: 'reality'
		});
	}
	const expectedOros = listRealityIntentKinds(realityYesod, registryYesod);
	throw new RangeError(
		`B"H | Unknown Reality intent "${kindOhr}". Expected: ${expectedOros.join(', ')}.`
	);
}

/**
 * Lists all currently executable intent kinds from both canonical registries.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {object} registryYesod Reality-exclusive intent registry.
 * @returns {ReadonlyArray<string>} Stable lexical union of executable kinds.
 */
export function listRealityIntentKinds(realityYesod, registryYesod) {
	const natureOros = realityYesod.advanced.nature.operationRegistry.kinds();
	return Object.freeze([...new Set([...natureOros, ...registryYesod.kinds()])].sort());
}

function normalizeNatureDescriptor(definitionBinah) {
	return Object.freeze({
		advancedPath: `advanced.nature.${definitionBinah.path.join('.')}`,
		defaultValue: definitionBinah.defaultValue ?? null,
		domain: `nature.${definitionBinah.path[0]}`,
		executor: 'nature',
		input: definitionBinah.input,
		kind: definitionBinah.kind,
		mode: definitionBinah.mode,
		path: definitionBinah.path,
		requiresValue: definitionBinah.requiresValue,
		resultKind: 'native-result'
	});
}
