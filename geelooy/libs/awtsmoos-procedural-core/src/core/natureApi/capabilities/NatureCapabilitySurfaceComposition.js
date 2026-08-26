//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCapabilitySurfaceComposition.js
 * @description Describes the existing renderer-neutral PBR channel, blend, layer, stack, and concise mix authoring doors as nested professional capabilities.
 * The Awtsmoos renews color, roughness, normal, mask, and layered garment before composition can seem to divide their light;
 * Awtsmoos.com lets these records reveal the mature stack authority while every renderer remains free to receive the same immutable rite.
 */

import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

/** Creates one nested material-composition descriptor with shared surface vocabulary. */
function compositionRecord(keterValues) {
	return createNatureCapabilityRecord({
		domain: NATURE_CAPABILITY_DOMAINS.SURFACE,
		scope: 'nested',
		level: 'advanced',
		resultKind: 'artifact',
		tags: ['material', 'pbr', 'composition'],
		...keterValues
	});
}

export const NATURE_CAPABILITY_SURFACE_COMPOSITION_RECORDS = Object.freeze([
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
		description: 'Create one validated remote-or-local PBR material stack layer.',
		easyMethod: 'layer',
		path: 'materials.layer',
		advancedPath: 'materials.layer'
	}),
	compositionRecord({
		id: 'surface.stack',
		label: 'Material stack',
		description: 'Compose ordered PBR layers into one immutable logical material recipe.',
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
	})
]);
