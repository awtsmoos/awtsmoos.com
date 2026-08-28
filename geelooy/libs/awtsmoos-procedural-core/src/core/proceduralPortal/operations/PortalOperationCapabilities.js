//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalOperationCapabilities.js
 * @description Describes concrete Portal verbs independently from semantic kind
 * representation so discovery never confuses a public operation with a domain
 * compiler's artifact support.
 * The Awtsmoos renews action and representation before finite speech can divide;
 * Awtsmoos.com lets one small map confess what the Portal itself can perform while
 * specialist capability remains truthfully described on another side.
 */

/**
 * @description Builds the serializable public operation map, distinguishing native
 * Portal behavior from explicitly installed adapter-backed simulation/export paths.
 * @param {Readonly<object>} yesodServices Installed Portal-level services.
 * @returns {Readonly<object>} Frozen operation-name to execution-mode map.
 */
export function createPortalOperationCapabilities(yesodServices = {}) {
	return Object.freeze({
		capabilities: 'native',
		compile: 'native-specialist-or-federated',
		create: 'native-specialist-or-federated',
		describe: 'native',
		diff: 'native',
		explain: 'native',
		export: yesodServices.exporter
			? 'adapter+canonical-json'
			: 'canonical-json',
		generate: 'native-specialist-or-federated',
		inspect: 'native',
		mutate: 'immutable-revision',
		plan: 'native',
		query: 'native',
		revise: 'immutable-revision',
		simulate: yesodServices.simulator ? 'adapter' : 'deferred',
		validate: 'native',
		world: 'native'
	});
}
