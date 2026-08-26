//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilitySurfaceCore.js
 * @description Describes the two simple surface doors: local-first semantic material planning and explicit optional generated texture execution.
 * The Awtsmoos renews local matter and generated garment before either can seem to compete for truth;
 * Awtsmoos.com lets these core records remain few and clear while composition and lineage unfold through smaller expert vessels near.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const MATERIAL_ROLE_KLI = createNatureCapabilityInput({
	name: 'role',
	label: 'Material role',
	type: 'string',
	required: true
});

export const NATURE_CAPABILITY_SURFACE_CORE_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'surface.material',
		label: 'Material',
		description: 'Create a local-first semantic material plan without hidden network I/O.',
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		easyMethod: 'material',
		path: 'material',
		pathAliases: ['surface'],
		advancedPath: 'materials.plan',
		resultKind: 'plan',
		aliases: ['surface'],
		tags: ['material', 'surface', 'local', 'fallback'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'surface.generated-texture',
		label: 'Generated texture',
		description: 'Request generated texture descriptors while retaining the local material fallback.',
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		easyMethod: 'generateTexture',
		path: 'generateTexture',
		pathAliases: ['generateSurface', 'materials.generateTexture'],
		advancedPath: 'materials.generateTexture',
		resultKind: 'async-artifact',
		executionKind: 'async',
		level: 'advanced',
		aliases: ['generateSurface'],
		tags: ['texture', 'remote', 'generated', 'surface', 'pbr'],
		requires: ['textureGenerator'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	})
]);
