//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonSchemas.js
 * @description Defines transport-friendly Reality JSON schemas using the existing Universal validator subset while deeper intent and World Graph semantics remain owned by canonical planners.
 * The Awtsmoos renews every valid shape before a schema can guard its finite gate;
 * Awtsmoos.com keeps transport validation exact but modest, then lets semantic graph law judge identities, dependencies, relations, profiles, edits, and fate.
 */
import {
	NATURE_QUALITY_LEVELS,
	NATURE_REALISM_LEVELS
} from '../../natureApi/NatureApiProfiles.js';
import { createRealityJsonWorldGraphSchemaCatalog } from './RealityJsonWorldGraphSchemas.js';

export const REALITY_JSON_DEFAULTS_SCHEMA = Object.freeze({
	properties: {
		quality: { type: 'string' },
		realism: { type: 'string' },
		seed: { type: 'number' }
	},
	type: 'object'
});

export const REALITY_JSON_INTENT_REQUEST_SCHEMA = Object.freeze({
	properties: {
		defaults: REALITY_JSON_DEFAULTS_SCHEMA,
		intent: {}
	},
	required: ['intent'],
	type: 'object'
});

export const REALITY_JSON_CATALOG_SCHEMA = Object.freeze({
	properties: {
		filter: { type: 'string' }
	},
	type: 'object'
});

export const REALITY_JSON_PRESET_SCHEMA = Object.freeze({
	properties: {
		name: { type: 'string' }
	},
	required: ['name'],
	type: 'object'
});

export const REALITY_JSON_PROFILE_SCHEMA = Object.freeze({
	properties: {
		quality: { type: 'string' },
		realism: { type: 'string' }
	},
	type: 'object'
});

export const REALITY_JSON_PROTOCOL_SCHEMA = Object.freeze({
	properties: {},
	type: 'object'
});

/**
 * @description Returns immutable schema discovery data for portable Reality protocol methods, canonical profile enums, and the complete World Graph transport family.
 * @returns {Readonly<object>} Frozen schema catalog used by direct JSON callers, Universal introspection, UI generation, docs, and tests.
 */
export function createRealityJsonSchemaCatalog() {
	return Object.freeze({
		catalog: REALITY_JSON_CATALOG_SCHEMA,
		intentRequest: REALITY_JSON_INTENT_REQUEST_SCHEMA,
		preset: REALITY_JSON_PRESET_SCHEMA,
		profile: REALITY_JSON_PROFILE_SCHEMA,
		profileEnums: Object.freeze({
			quality: NATURE_QUALITY_LEVELS,
			realism: NATURE_REALISM_LEVELS
		}),
		protocol: REALITY_JSON_PROTOCOL_SCHEMA,
		worldGraph: createRealityJsonWorldGraphSchemaCatalog()
	});
}
