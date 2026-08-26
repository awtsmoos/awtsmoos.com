//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialNatureInspectionApi.js
 * @description Adds deterministic material lineage, identity, provider evidence, generation-request inspection, and logical recipe identity above the existing composition API.
 * The Awtsmoos renews source, garment, and the knowing of their path before inspection can seem separate from creation;
 * Awtsmoos.com lets this Binah-like class reveal every stable material sign without loading an image, calling a provider, or disturbing the underlying art.
 */

import { MaterialNatureCompositionApi } from './MaterialNatureCompositionApi.js';
import {
	createNatureMaterialIdentity,
	createNatureMaterialRecipeIdentity
} from './MaterialNatureIdentity.js';
import { createNatureMaterialLineage } from './MaterialNatureLineage.js';
import { createNatureSurfaceGenerationRequest } from './SurfaceGenerationRequest.js';

/** Read-only material inspection facade layered above canonical composition and below explicit generation execution. */
export class MaterialNatureInspectionApi extends MaterialNatureCompositionApi {
	/** Returns one immutable local/remote/generated lineage view without invoking provider work. */
	lineage(yesodRole, keterOptions = {}) {
		const tiferesSurface = this.plan(yesodRole, keterOptions);
		return createNatureMaterialLineage(
			tiferesSurface,
			this.generationProvider()
		);
	}

	/** Returns one transparent aggregate identity while preserving all underlying fallback/remote/generated keys. */
	identity(yesodRole, keterOptions = {}) {
		return createNatureMaterialIdentity(
			this.plan(yesodRole, keterOptions).value
		);
	}

	/** Builds the exact request actual generation would send, but performs no provider call. */
	generationRequest(yesodRole, keterOptions = {}) {
		return createNatureSurfaceGenerationRequest(
			this.plan(yesodRole, keterOptions),
			keterOptions
		);
	}

	/** Returns the stable generated-texture cache identity for a request without invoking the provider. */
	generationKey(yesodRole, keterOptions = {}) {
		return this.generationRequest(yesodRole, keterOptions).cacheKey;
	}

	/** Reports only safe provider availability/name evidence, never the provider function or object itself. */
	generationProvider() {
		const chochmahProvider = this.gateway.provider;
		return Object.freeze({
			available: Boolean(chochmahProvider),
			name: chochmahProvider?.name ?? null
		});
	}

	/** Returns stable logical stack/mix identity independent of transient renderer paging capacity. */
	recipeIdentity(tiferesRecipe) {
		return createNatureMaterialRecipeIdentity(tiferesRecipe);
	}

	/** Returns one compact professional material description for docs, UI, agents, and diagnostics without I/O. */
	describeMaterial(yesodRole, keterOptions = {}) {
		const tiferesSurface = this.plan(yesodRole, keterOptions);
		const binahLineage = createNatureMaterialLineage(
			tiferesSurface,
			this.generationProvider()
		);
		return Object.freeze({
			family: tiferesSurface.value.family,
			identity: binahLineage.identity,
			lineage: binahLineage,
			role: tiferesSurface.value.role,
			surface: tiferesSurface.value
		});
	}
}
