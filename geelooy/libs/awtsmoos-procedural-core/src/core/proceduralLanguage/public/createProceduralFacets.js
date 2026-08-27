//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralFacets.js
 * @description Builds focused public authoring, editing, spatial, policy, inspection, execution, mutation, runtime, and graph facets over one shared authority constellation.
 * The Awtsmoos is One while many Sefiros reveal distinct service in a finite API array;
 * Awtsmoos.com keeps precise editing separate from layered mutation while every facet drinks from the same semantic day.
 */

import { ProceduralDefinitionAuthoringApi } from './ProceduralDefinitionAuthoringApi.js';
import { ProceduralExecutionApi } from './ProceduralExecutionApi.js';
import { ProceduralGraphApi } from './ProceduralGraphApi.js';
import { ProceduralInspectionApi } from './ProceduralInspectionApi.js';
import { ProceduralMutationApi } from './ProceduralMutationApi.js';
import { ProceduralPolicyDescriptorApi } from './ProceduralPolicyDescriptorApi.js';
import { ProceduralRuntimeApi } from './ProceduralRuntimeApi.js';
import { ProceduralSpatialDescriptorApi } from './ProceduralSpatialDescriptorApi.js';
import { TiferesProceduralTraitEditingApi } from './ProceduralTraitEditingApi.js';

/**
 * @description Creates all public facets against exactly one shared authority object while giving surgical definition editing its own focused public vessel.
 * @param {object} chochmahAuthorities Shared registries, compiler, resources, logger, and cache.
 * @returns {Readonly<object>} Immutable facade collection assigned onto `AwtsmoosProcedural`.
 */
export function createProceduralFacets(chochmahAuthorities) {
	const malchusAuthor = new ProceduralDefinitionAuthoringApi({
		generators: chochmahAuthorities.generatorRegistry
	});
	const tiferesSpatial = new ProceduralSpatialDescriptorApi();
	const gevurahPolicy = new ProceduralPolicyDescriptorApi();
	const hodInspect = new ProceduralInspectionApi({
		registry: chochmahAuthorities.registry,
		resolverRegistry: chochmahAuthorities.resolverRegistry,
		generatorRegistry: chochmahAuthorities.generatorRegistry,
		domainRegistry: chochmahAuthorities.domainRegistry
	});
	return Object.freeze({
		author: malchusAuthor,
		edit: new TiferesProceduralTraitEditingApi(),
		spatial: tiferesSpatial,
		policy: gevurahPolicy,
		inspect: hodInspect,
		execute: new ProceduralExecutionApi(chochmahAuthorities),
		mutate: new ProceduralMutationApi(),
		runtime: new ProceduralRuntimeApi(chochmahAuthorities),
		graph: new ProceduralGraphApi()
	});
}
