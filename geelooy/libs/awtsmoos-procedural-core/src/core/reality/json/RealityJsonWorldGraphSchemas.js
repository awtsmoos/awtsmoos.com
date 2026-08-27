//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonWorldGraphSchemas.js
 * @description Declares transport-level schemas for portable World Graph construction, querying, editing, diffing, and planning without duplicating deeper semantic graph validation.
 * The Awtsmoos renews every world before transport can ask for node, query, edit, difference, or plan through finite JSON form;
 * Awtsmoos.com lets schemas guard the outer vessel while canonical World Graph and Reality planners still own the deeper law beneath each norm.
 */

export const REALITY_JSON_WORLD_GRAPH_SCHEMA = Object.freeze({
	properties: {
		capabilityRequirements: { type: 'object' },
		defaults: { type: 'object' },
		metadata: { type: 'object' },
		nodes: { items: { type: 'object' }, type: 'array' },
		provenance: { type: 'object' },
		rootSeed: { type: 'number' },
		seed: { type: 'number' }
	},
	type: 'object'
});

export const REALITY_JSON_WORLD_QUERY_SCHEMA = Object.freeze({
	properties: {
		graph: { type: 'object' },
		query: { type: 'object' }
	},
	required: ['graph', 'query'],
	type: 'object'
});

export const REALITY_JSON_WORLD_EDIT_SCHEMA = Object.freeze({
	properties: {
		edits: {},
		graph: { type: 'object' }
	},
	required: ['graph', 'edits'],
	type: 'object'
});

export const REALITY_JSON_WORLD_DIFF_SCHEMA = Object.freeze({
	properties: {
		after: { type: 'object' },
		before: { type: 'object' }
	},
	required: ['before', 'after'],
	type: 'object'
});

export const REALITY_JSON_WORLD_PLAN_SCHEMA = Object.freeze({
	properties: {
		defaults: { type: 'object' },
		graph: { type: 'object' }
	},
	required: ['graph'],
	type: 'object'
});

/**
 * @description Returns one immutable World Graph transport-schema catalog so protocol discovery and generated tools can consume all five operation shapes from one source.
 * @returns {Readonly<object>} Frozen schema map keyed by worldGraph/queryWorld/editWorld/diffWorld/planWorld.
 */
export function createRealityJsonWorldGraphSchemaCatalog() {
	return Object.freeze({
		diffWorld: REALITY_JSON_WORLD_DIFF_SCHEMA,
		editWorld: REALITY_JSON_WORLD_EDIT_SCHEMA,
		planWorld: REALITY_JSON_WORLD_PLAN_SCHEMA,
		queryWorld: REALITY_JSON_WORLD_QUERY_SCHEMA,
		worldGraph: REALITY_JSON_WORLD_GRAPH_SCHEMA
	});
}
