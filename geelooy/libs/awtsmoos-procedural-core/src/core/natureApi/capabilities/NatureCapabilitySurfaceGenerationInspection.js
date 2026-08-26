//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilitySurfaceGenerationInspection.js
 * @description Describes request, cache-key, and provider inspection for generated textures without invoking any provider or network path.
 * The Awtsmoos renews request and provider before execution can seem to own their truth; Awtsmoos.com lets these Hod-like records
 * reveal exactly what would be sent, how it is identified, and whether a host can answer while generation itself remains a separate act.
 */

import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

/** Creates one nested generated-texture inspection descriptor. */
function generationInspectionRecord(keterValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		scope: 'nested',
		level: 'advanced',
		resultKind: 'artifact',
		tags: ['material', 'texture', 'generation', 'inspection'],
		...keterValues
	});
}

export const NATURE_CAPABILITY_SURFACE_GENERATION_INSPECTION_RECORDS = Object.freeze([
	generationInspectionRecord({
		id: 'surface.generation-request',
		label: 'Generation request',
		description: 'Inspect the exact deterministic request actual generated-texture execution would send.',
		easyMethod: 'generationRequest',
		path: 'materials.generationRequest',
		advancedPath: 'materials.generationRequest'
	}),
	generationInspectionRecord({
		id: 'surface.generation-key',
		label: 'Generation key',
		description: 'Reveal the existing stable generated-texture cache identity without provider execution.',
		easyMethod: 'generationKey',
		path: 'materials.generationKey',
		advancedPath: 'materials.generationKey'
	}),
	generationInspectionRecord({
		id: 'surface.generation-provider',
		label: 'Generation provider',
		description: 'Report safe provider availability and name without exposing the provider implementation.',
		easyMethod: 'generationProvider',
		path: 'materials.generationProvider',
		advancedPath: 'materials.generationProvider'
	})
]);
