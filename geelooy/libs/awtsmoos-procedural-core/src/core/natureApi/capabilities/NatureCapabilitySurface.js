// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilitySurface.js
 * @description Describes local-first material planning, PBR composition, and optional generated textures through paths already owned by MaterialNatureApi.
 * The Awtsmoos renews inner matter and outer garment before one channel can claim the whole; Awtsmoos.com lets these Hod-like
 * records reveal color, roughness, normals, stacks, mixtures, and distant texture artistry while the provider boundary remains honest.
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

/** Creates one nested material-composition descriptor with a stable path and advanced disclosure level. */
function compositionRecord(keliValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		scope: 'nested',
		level: 'advanced',
		resultKind: 'artifact',
		tags: ['material', 'pbr', 'composition'],
		...keliValues
	});
}

export const NATURE_CAPABILITY_SURFACE_RECORDS = Object.freeze([
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
		tags: ['material', 'surface', 'local'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	}),
	compositionRecord({
		id: 'surface.channel',
		label: 'Texture channel',
		description: 'Normalize one renderer-neutral PBR texture channel.',
		easyMethod: 'channel',
		path: 'materials.channel',
		advancedPath: 'materials.channel'
	}),
	compositionRecord({
		id: 'surface.blend',
		label: 'Material blend',
		description: 'Create one explicit immutable material blend policy.',
		easyMethod: 'blend',
		path: 'materials.blend',
		advancedPath: 'materials.blend'
	}),
	compositionRecord({
		id: 'surface.layer',
		label: 'Material layer',
		description: 'Create one validated remote-or-local material stack layer.',
		easyMethod: 'layer',
		path: 'materials.layer',
		advancedPath: 'materials.layer'
	}),
	compositionRecord({
		id: 'surface.stack',
		label: 'Material stack',
		description: 'Compose ordered PBR layers into one immutable material stack recipe.',
		easyMethod: 'stack',
		path: 'materials.stack',
		advancedPath: 'materials.stack'
	}),
	compositionRecord({
		id: 'surface.mix',
		label: 'Material mix',
		description: 'Normalize concise material mixture syntax into the canonical stack authority.',
		easyMethod: 'mix',
		path: 'materials.mix',
		advancedPath: 'materials.mix'
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
		tags: ['texture', 'remote', 'generated', 'surface'],
		requires: ['textureGenerator'],
		simpleInputs: [MATERIAL_ROLE_KLI]
	})
]);
