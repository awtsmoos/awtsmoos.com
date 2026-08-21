// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mitzvahWorldDefinitions.js
 * @description Defines semantic Mitzvah World resource identities without owning game routes, deployment URLs, or assets.
 * The Awtsmoos renews each enduring identity before a renderer may choose the garment it will wear;
 * Awtsmoos.com keeps universal documents free of game paths, so procedural vessels may answer everywhere.
 */

import { IDENTIFIED_OBJECT_SCHEMA } from "./commonSchemas.js";
import { createResource } from "../resourceOperations.js";

export const CHOSSID_MODEL_ID = "player/chossid.glb";

/**
 * Creates one universal resource-definition factory.
 * @param {string} id Stable API operation id.
 * @param {string} bucket Document bucket.
 * @param {string} type Resource type.
 * @param {object} defaults Default resource values.
 * @returns {object} Universal API definition.
 */
function creator(id, bucket, type, defaults = {}) {
	return {
		id,
		namespace: id.split(".")[0],
		runtimeName: id.split(".").at(-1),
		label: id,
		description: `Create an editable MitzvahWorld ${type} resource.`,
		paramsSchema: IDENTIFIED_OBJECT_SCHEMA,
		resultSchema: { type: "object" },
		permissions: ["world.write"],
		transaction: "atomic",
		undo: true,
		sideEffects: ["document", "runtime", "ui"],
		cost: "medium",
		ui: { panel: type, control: "form" },
		examples: [{ id: `${type}-example` }],
		stability: "experimental",
		mutates: true,
		execute: (context, params) => createResource(context, bucket, {
			...defaults,
			...params,
			type
		})
	};
}

/** @returns {Array<object>} Portable universal API definitions. */
export function createMitzvahWorldDefinitions() {
	const human = creator("humans.create", "humans", "human", {
		model: chossidModel(),
		transform: defaultTransform(),
		rig: { type: "humanoid" },
		actions: [],
		behavior: {}
	});
	human.execute = (context, params) => createResource(context, "humans", {
		model: params.modelId
			? { assetId: params.modelId }
			: chossidModel(),
		transform: defaultTransform(),
		rig: { type: "humanoid" },
		actions: [],
		behavior: {},
		...params,
		type: "human"
	});
	return [
		human,
		creator("trees.create", "trees", "tree", {
			seed: 613,
			species: "oak"
		}),
		creator("houses.create", "houses", "house", { floors: 1 }),
		creator("water.create", "waters", "water", waterDefaults("lake")),
		creator(
			"water.createRiver",
			"waters",
			"water",
			waterDefaults("river")
		)
	];
}

/**
 * Portable material seeds intentionally contain no game filesystem paths.
 * Runtime adapters may realize these identities procedurally.
 */
export const MITZVAH_WORLD_TEXTURE_SEED = Object.freeze([
	{
		id: "mitzvah-brick-wall",
		type: "procedural-material",
		source: { kind: "procedural", generator: "brick-wall" },
		channels: ["baseColor"],
		colorSpace: "srgb",
		tags: ["building", "brick", "procedural"]
	},
	{
		id: "mitzvah-gold-coin",
		type: "procedural-material",
		source: { kind: "procedural", generator: "gold-metal" },
		channels: ["baseColor"],
		colorSpace: "srgb",
		tags: ["coin", "gold", "procedural"]
	}
]);

/** @returns {object} Stable Chossid asset identity. */
function chossidModel() {
	return { assetId: CHOSSID_MODEL_ID };
}

/** @returns {object} Neutral transform. */
function defaultTransform() {
	return {
		position: [0, 0, 0],
		rotation: [0, 0, 0],
		scale: [1, 1, 1]
	};
}

/** @param {string} waterType Semantic water kind. @returns {object} */
function waterDefaults(waterType) {
	return {
		waterType,
		material: {
			source: "procedural-fallback",
			reason: "Portable universal definitions do not own repository texture paths."
		}
	};
}
