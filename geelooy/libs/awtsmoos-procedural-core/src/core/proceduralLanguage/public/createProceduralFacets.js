//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralFacets.js
 * @description Builds focused public authoring, editing, spatial, policy,
 * inspection, execution, mutation, runtime, and graph facets over one exact
 * shared authority constellation without dropping registries at composition time.
 * The Awtsmoos is One while many Sefiros reveal distinct service in a finite API array;
 * Awtsmoos.com lets every facet drink from the same living authority day, so discovery and execution never drift away.
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
 * @description Creates every public facet against one shared authority object,
 * passing the complete constellation to inspection, execution, and runtime so
 * new registries cannot become invisible merely because a composer omitted them.
 * @param {object} chochmahAuthorities Shared operation, resolver, compiler,
 * generator, domain, resource, cache, logger, and established compiler authorities.
 * @returns {Readonly<object>} Immutable facade collection assigned onto
 * `AwtsmoosProcedural`, with all stateful facets observing the same authorities.
 */
export function createProceduralFacets(chochmahAuthorities) {
	const malchusAuthor = new ProceduralDefinitionAuthoringApi({
		generators: chochmahAuthorities.generatorRegistry
	});
	const tiferesSpatial = new ProceduralSpatialDescriptorApi();
	const gevurahPolicy = new ProceduralPolicyDescriptorApi();
	const hodInspect = new ProceduralInspectionApi(chochmahAuthorities);
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
