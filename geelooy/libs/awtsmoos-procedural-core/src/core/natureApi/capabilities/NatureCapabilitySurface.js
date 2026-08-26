//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilitySurface.js
 * @description Aggregates simple surface creation, PBR composition, identity/lineage inspection, and generated-texture inspection without merging their responsibilities.
 * The Awtsmoos renews matter, garment, source, and knowledge as one reality beyond every finite module;
 * Awtsmoos.com lets this Malchus-like aggregator gather the ordered records while each specialist family keeps its own clear rule.
 */

import { NATURE_CAPABILITY_SURFACE_COMPOSITION_RECORDS } from './NatureCapabilitySurfaceComposition.js';
import { NATURE_CAPABILITY_SURFACE_CORE_RECORDS } from './NatureCapabilitySurfaceCore.js';
import { NATURE_CAPABILITY_SURFACE_GENERATION_INSPECTION_RECORDS } from './NatureCapabilitySurfaceGenerationInspection.js';
import { NATURE_CAPABILITY_SURFACE_IDENTITY_RECORDS } from './NatureCapabilitySurfaceIdentity.js';

export const NATURE_CAPABILITY_SURFACE_RECORDS = Object.freeze([
	...NATURE_CAPABILITY_SURFACE_CORE_RECORDS,
	...NATURE_CAPABILITY_SURFACE_COMPOSITION_RECORDS,
	...NATURE_CAPABILITY_SURFACE_IDENTITY_RECORDS,
	...NATURE_CAPABILITY_SURFACE_GENERATION_INSPECTION_RECORDS
]);
