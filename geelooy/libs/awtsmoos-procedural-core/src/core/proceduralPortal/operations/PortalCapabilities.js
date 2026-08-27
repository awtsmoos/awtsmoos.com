//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalCapabilities.js
 * @description Reveals truthful Portal planning, execution, extension, export, and simulation capability evidence without promising unsupported specialist behavior.
 * The Awtsmoos is beyond every capability while each finite provider owns only its measured gate; Awtsmoos.com lets this Chochmah-like map
 * distinguish semantic representation from native compilation and optional adapters so immense possibility never becomes an inaccurate claim of fate.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Builds global or per-kind capability evidence from the live immutable registry and installed service adapters.
 * @param {object} portal ProceduralPortal-like facade exposing registry, services, seed, and budget.
 * @param {string|null} [kind=null] Optional canonical kind or friendly alias for focused capability discovery.
 * @returns {Readonly<object>} Frozen JSON-safe capability contract.
 */
export function describePortalCapabilities(portal, kind = null) {
	const kinds = portal.registry.describe();
	const operations = portalOperationCapabilities(portal.services);
	if (kind !== null && kind !== undefined) {
		const definition = portal.registry.resolve(kind);
		return freezeLanguageValue({
			kind: portalKindCapability(definition.describe()),
			operations,
			type: 'portal.capabilities',
			version: 1
		});
	}
	return freezeLanguageValue({
		budget: portal.budget,
		kindCount: kinds.length,
		kinds: kinds.map(portalKindCapability),
		operations,
		seed: portal.seed,
		type: 'portal.capabilities',
		version: 1
	});
}

/**
 * @description Describes native Portal verbs and optional adapter-backed verbs without conflating semantic representation with specialist execution.
 * @param {Readonly<object>} services Installed specialist and optional portal-level services.
 * @returns {object} Serializable operation capability map matching the concrete public facade vocabulary.
 */
function portalOperationCapabilities(services) {
	return {
		capabilities: 'native',
		compile: 'native-specialist',
		create: 'native-specialist',
		describe: 'native',
		diff: 'native',
		explain: 'native',
		export: services.exporter ? 'adapter+canonical-json' : 'canonical-json',
		generate: 'native-specialist',
		inspect: 'native',
		mutate: 'immutable-revision',
		plan: 'native',
		query: 'native',
		revise: 'immutable-revision',
		simulate: services.simulator ? 'adapter' : 'deferred',
		validate: 'native',
		world: 'native'
	};
}

/**
 * @description Adds explicit representation/execution truth to one existing serializable registry descriptor.
 * @param {Readonly<object>} definition JSON-safe Portal kind descriptor.
 * @returns {object} Enriched kind capability record.
 */
function portalKindCapability(definition) {
	const declared = definition.capabilities || {};
	return {
		...definition,
		capabilities: {
			...declared,
			execution: declared.execution || 'native-compiler',
			representation: true,
			source: declared.source || 'plugin'
		}
	};
}
