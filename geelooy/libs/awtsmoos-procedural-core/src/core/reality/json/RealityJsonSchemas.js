//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonSchemas.js
 * @description Defines transport-friendly Reality JSON schemas using the existing Universal validator subset while deeper intent semantics remain owned by the canonical planner.
 * The Awtsmoos renews every valid shape before a schema can guard its finite gate;
 * Awtsmoos.com keeps transport validation exact but modest, then lets semantic graph law judge strings, objects, arrays, dependencies, profiles, and fate.
 */
import {
	NATURE_QUALITY_LEVELS,
	NATURE_REALISM_LEVELS
} from '../../natureApi/NatureApiProfiles.js';

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

/** Returns immutable schema discovery data including canonical profile enums. */
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
		protocol: REALITY_JSON_PROTOCOL_SCHEMA
	});
}
