//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWorldGraphDefinitionSpecs.js
 * @description Declares Universal World Graph JSON commands as immutable data so execution, schema discovery, examples, Explorer rendering, docs, and agents share one portable command covenant.
 * The Awtsmoos renews world, query, edit, difference, and plan before Universal can give each operation a dotted finite name;
 * Awtsmoos.com lets one metadata shard illuminate transport and tooling while the actual graph semantics remain wholly owned by Reality beneath the frame.
 */
import {
	REALITY_JSON_WORLD_DIFF_SCHEMA,
	REALITY_JSON_WORLD_EDIT_SCHEMA,
	REALITY_JSON_WORLD_GRAPH_SCHEMA,
	REALITY_JSON_WORLD_PLAN_SCHEMA,
	REALITY_JSON_WORLD_QUERY_SCHEMA
} from '../../reality/json/RealityJsonWorldGraphSchemas.js';

const OBJECT_RESULT = Object.freeze({ type: 'object' });
const OBJECT_ARRAY_RESULT = Object.freeze({
	items: { type: 'object' },
	type: 'array'
});

/** Frozen portable World Graph command specifications consumed by the existing generic Reality JSON definition adapter. */
export const REALITY_WORLD_GRAPH_DEFINITION_SPECS = Object.freeze([
	spec('reality.worldGraph', 'Create portable World Graph', 'worldGraph', REALITY_JSON_WORLD_GRAPH_SCHEMA, OBJECT_RESULT, worldExample()),
	spec('reality.queryWorld', 'Query portable World Graph', 'queryWorld', REALITY_JSON_WORLD_QUERY_SCHEMA, OBJECT_ARRAY_RESULT, {
		graph: worldExample(),
		query: { op: 'type', value: 'moss' }
	}),
	spec('reality.editWorld', 'Edit portable World Graph', 'editWorld', REALITY_JSON_WORLD_EDIT_SCHEMA, OBJECT_RESULT, {
		edits: { id: 'moss', op: 'mergeOptions', options: { density: 0.8 } },
		graph: worldExample()
	}),
	spec('reality.diffWorld', 'Diff portable World Graphs', 'diffWorld', REALITY_JSON_WORLD_DIFF_SCHEMA, OBJECT_RESULT, {
		after: worldExample({ quality: 'high' }),
		before: worldExample()
	}),
	spec('reality.planWorld', 'Plan portable World Graph', 'planWorld', REALITY_JSON_WORLD_PLAN_SCHEMA, OBJECT_RESULT, {
		defaults: { quality: 'balanced' },
		graph: worldExample()
	}, 'medium')
]);

/**
 * @description Creates one immutable World Graph command specification matching the metadata shape already consumed by the generic Reality JSON definition adapter.
 * @param {string} idYesod Stable dotted Universal command ID.
 * @param {string} labelHod Human-readable command label.
 * @param {string} methodMalchus Exact method invoked on `reality.json`.
 * @param {object} paramsSchemaBinah Universal-compatible transport parameter schema.
 * @param {object} resultSchemaChochmah Universal-compatible portable result schema.
 * @param {object} exampleKli Portable example request.
 * @param {'low'|'medium'|'high'} [costGevurah='low'] Conservative computational cost classification.
 * @returns {Readonly<object>} Frozen portable command specification.
 */
function spec(
	idYesod,
	labelHod,
	methodMalchus,
	paramsSchemaBinah,
	resultSchemaChochmah,
	exampleKli,
	costGevurah = 'low'
) {
	return Object.freeze({
		cost: costGevurah,
		example: Object.freeze({ ...exampleKli }),
		id: idYesod,
		label: labelHod,
		method: methodMalchus,
		paramsSchema: paramsSchemaBinah,
		resultSchema: resultSchemaChochmah
	});
}

/**
 * @description Returns a compact deterministic cross-domain World Graph example with explicit expert options and a supported semantic relation.
 * @param {object} [terrainOptionsChesed={}] Optional terrain option overrides demonstrating expert flexibility in example data.
 * @returns {Readonly<object>} Frozen portable graph-like request accepted by `reality.json.worldGraph`.
 */
function worldExample(terrainOptionsChesed = {}) {
	return Object.freeze({
		nodes: [
			{ id: 'terrain', options: { profile: 'mountain', ...terrainOptionsChesed }, type: 'terrain' },
			{ id: 'pond', on: 'terrain', options: { depth: 0.5, height: 8, width: 8 }, type: 'pond' },
			{ around: 'pond', id: 'moss', options: { species: 'sheet-moss' }, type: 'moss' }
		],
		rootSeed: 613
	});
}
