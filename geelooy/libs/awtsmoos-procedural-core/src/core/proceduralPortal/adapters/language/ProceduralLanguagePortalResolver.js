//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguagePortalResolver.js
 * @description Federates every semantic kind recognized by one Universal Semantic
 * Kernel into Portal while consuming the same canonical definition and artifact
 * request already prepared for every other specialist.
 * The Awtsmoos renews unknown noun and registered compiler before either appears;
 * Awtsmoos.com lets Portal and language federation meet through one context, so no
 * parallel definition or output grammar must secretly multiply between their spheres.
 */

import { BinahPortalKindResolver } from '../../registry/PortalKindResolver.js';
import {
	describeFederatedKind,
	describeLanguageFederation,
	matchingLanguageCapabilities
} from './ProceduralLanguagePortalDiscovery.js';
import { portalLanguageCompileIsStrict } from './ProceduralLanguagePortalCompilePolicy.js';

export class TiferesProceduralLanguagePortalResolver extends BinahPortalKindResolver {
	/**
	 * @description Creates a live dynamic resolver over one universal kernel so
	 * later compiler registrations become Portal-visible without global mutation.
	 * @param {object} kesserKernel Universal kernel exposing capabilities/compile.
	 * @throws {TypeError} When discovery or compilation is unavailable.
	 */
	constructor(kesserKernel) {
		assertKernel(kesserKernel);
		super({
			id: 'procedural-language-federation',
			description: 'Federates Procedural Language compiler patterns into Portal semantic kinds.',
			patterns: () => kindPatterns(kesserKernel.capabilities()),
			resolve: (yesodKind) => resolveKind(kesserKernel, yesodKind),
			describe: () => describeLanguageFederation(kesserKernel.capabilities()),
			metadata: { source: 'awtsmoos.procedural-language/1' }
		});
	}
}

/** @private */
function resolveKind(kesserKernel, yesodKind) {
	const chochmahCapabilities = matchingLanguageCapabilities(
		kesserKernel.capabilities(),
		yesodKind
	);
	if (!chochmahCapabilities.length) return null;
	return {
		kind: yesodKind,
		mode: 'async',
		stability: weakestStability(chochmahCapabilities),
		description: `Federated Procedural Language kind: ${yesodKind}`,
		capabilities: describeFederatedKind(
			yesodKind,
			chochmahCapabilities
		),
		compiler: (tiferesContext) => compileFederated(
			kesserKernel,
			tiferesContext
		)
	};
}

/** @private */
async function compileFederated(kesserKernel, tiferesContext) {
	const binahRequest = tiferesContext.artifactRequest;
	return kesserKernel.compile(
		tiferesContext.canonicalDefinition,
		binahRequest,
		{ strict: portalLanguageCompileIsStrict(binahRequest) }
	);
}

/** @private */
function kindPatterns(capabilities) {
	return [...new Set(capabilities.flatMap(
		(capability) => capability.kinds || []
	))].sort();
}

/** @private */
function weakestStability(capabilities) {
	if (capabilities.some(
		(capability) => capability.stability === 'experimental'
	)) {
		return 'experimental';
	}
	if (capabilities.every((capability) => capability.stability === 'stable')) {
		return 'stable';
	}
	return 'internal';
}

/** @private */
function assertKernel(kesserKernel) {
	if (
		!kesserKernel
		|| typeof kesserKernel.capabilities !== 'function'
		|| typeof kesserKernel.compile !== 'function'
	) {
		throw new TypeError(
			'B"H | Procedural Language Portal resolver requires a universal kernel.'
		);
	}
}
