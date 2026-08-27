//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonDefinitionSpecs.js
 * @description Declares portable Reality JSON commands as immutable data so Universal execution, Explorer rendering, docs, examples, and schema discovery share one command covenant.
 * RESPONSIBILITY: name portable methods, labels, schemas, examples, costs, and UI grouping without constructing executors or invoking Reality.
 * NON-RESPONSIBILITY: this vessel never duplicates `reality.json`, history, batching, permissions, or transaction mechanics.
 * The Awtsmoos renews protocol, plan, schema, preset, and profile before a dotted command can carry their light;
 * Awtsmoos.com lets one data shard feed every tool, so documentation and execution no longer drift apart at night.
 */
import {
	REALITY_JSON_CATALOG_SCHEMA,
	REALITY_JSON_INTENT_REQUEST_SCHEMA,
	REALITY_JSON_PRESET_SCHEMA,
	REALITY_JSON_PROFILE_SCHEMA,
	REALITY_JSON_PROTOCOL_SCHEMA
} from "../../reality/json/RealityJsonSchemas.js";

const OBJECT_RESULT = Object.freeze({ type: "object" });
const STRING_ARRAY_RESULT = Object.freeze({
	items: { type: "string" },
	type: "array"
});
const OBJECT_ARRAY_RESULT = Object.freeze({
	items: { type: "object" },
	type: "array"
});

/** Frozen portable Reality JSON command specifications consumed by the Universal definition adapter. */
export const REALITY_JSON_DEFINITION_SPECS = Object.freeze([
	spec("reality.protocol", "Reality JSON protocol", "protocol", REALITY_JSON_PROTOCOL_SCHEMA, OBJECT_RESULT, {}),
	spec("reality.schemas", "Reality JSON schemas", "schemas", REALITY_JSON_PROTOCOL_SCHEMA, OBJECT_RESULT, {}),
	spec("reality.plan", "Plan Reality intent", "plan", REALITY_JSON_INTENT_REQUEST_SCHEMA, OBJECT_RESULT, intentExample(), "medium"),
	spec("reality.explain", "Explain Reality intent", "explain", REALITY_JSON_INTENT_REQUEST_SCHEMA, OBJECT_RESULT, intentExample(), "medium"),
	spec("reality.validate", "Validate Reality intent", "validate", REALITY_JSON_INTENT_REQUEST_SCHEMA, OBJECT_RESULT, intentExample()),
	spec("reality.catalog", "Inspect Reality capability covenant", "catalog", REALITY_JSON_CATALOG_SCHEMA, OBJECT_RESULT, { filter: "water" }),
	spec("reality.intents", "List Reality intents", "intents", REALITY_JSON_PROTOCOL_SCHEMA, STRING_ARRAY_RESULT, {}),
	spec("reality.presets", "List Reality scene presets", "presets", REALITY_JSON_PROTOCOL_SCHEMA, STRING_ARRAY_RESULT, {}),
	spec("reality.preset", "Expand Reality scene preset", "preset", REALITY_JSON_PRESET_SCHEMA, OBJECT_ARRAY_RESULT, { name: "lush-pond" }),
	spec("reality.aliases", "Inspect Reality aliases", "aliases", REALITY_JSON_PROTOCOL_SCHEMA, OBJECT_RESULT, {}),
	spec("reality.profile", "Normalize Reality profile", "profile", REALITY_JSON_PROFILE_SCHEMA, OBJECT_RESULT, { quality: "balanced", realism: "real" }),
	spec("reality.realism", "Inspect Reality realism support", "realism", REALITY_JSON_PROTOCOL_SCHEMA, OBJECT_RESULT, {})
]);

/**
 * @description Creates one immutable command specification with schemas and examples that remain plain portable data.
 * @param {string} idYesod Stable dotted Universal command id.
 * @param {string} labelHod Human-readable command label shown in discovery and Explorer UI.
 * @param {string} methodMalchus Method name invoked on the strict `reality.json` façade.
 * @param {object} paramsSchemaBinah Universal-compatible parameter schema.
 * @param {object} resultSchemaChochmah Universal-compatible result schema.
 * @param {object} exampleKli Portable example parameter object.
 * @param {'low'|'medium'|'high'} [costGevurah='low'] Conservative computational cost label.
 * @returns {Readonly<object>} Frozen command specification containing only portable metadata.
 */
function spec(
	idYesod,
	labelHod,
	methodMalchus,
	paramsSchemaBinah,
	resultSchemaChochmah,
	exampleKli,
	costGevurah = "low"
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
 * @description Returns one deterministic cross-domain planning example reused by plan, explain, and validate discovery.
 * @returns {Readonly<object>} Frozen portable request demonstrating water and moss dependency composition.
 */
function intentExample() {
	return Object.freeze({
		defaults: { quality: "balanced", seed: 613 },
		intent: [
			{ id: "water", type: "pond" },
			{ around: "water", id: "moss", species: "sheet-moss", type: "moss" }
		]
	});
}
