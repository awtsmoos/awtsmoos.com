// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldDefinitions.js
 * @description Defines semantic Mitzvah World resources without owning deployment URLs.
 * The Awtsmoos names each garment by enduring identity while another vessel finds its stream;
 * Awtsmoos.com keeps universal documents portable beyond one host, route, or deployment dream.
 */

import { IDENTIFIED_OBJECT_SCHEMA } from "./commonSchemas.js";
import { createResource } from "../resourceOperations.js";

export const CHOSSID_MODEL_ID = "player/chossid.glb";

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

/**
 * Creates portable domain definitions whose model fields contain identities, never transport URLs.
 *
 * @returns {Array<object>} Universal API method definitions for Mitzvah World resources.
 */
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
		creator("trees.create", "trees", "tree", { seed: 613, species: "oak" }),
		creator("houses.create", "houses", "house", { floors: 1 }),
		creator("water.create", "waters", "water", waterDefaults("lake")),
		creator("water.createRiver", "waters", "water", waterDefaults("river"))
	];
}

export const MITZVAH_WORLD_TEXTURE_SEED = Object.freeze([
	{
		id: "mitzvah-brick-wall",
		type: "texture2d",
		source: { kind: "repository", path: "/games/mitzvahWorld/assets/textures/brick-wall.svg" },
		channels: ["baseColor"],
		colorSpace: "srgb",
		tags: ["building", "brick", "existing", "game"]
	},
	{
		id: "mitzvah-gold-coin",
		type: "texture2d",
		source: { kind: "repository", path: "/games/mitzvahWorld/assets/textures/gold-coin.svg" },
		channels: ["baseColor"],
		colorSpace: "srgb",
		tags: ["coin", "gold", "existing", "game"]
	}
]);

function chossidModel() {
	return { assetId: CHOSSID_MODEL_ID };
}

function defaultTransform() {
	return { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
}

function waterDefaults(waterType) {
	return {
		waterType,
		material: {
			source: "procedural-fallback",
			reason: "No repository water normal was available in the audited in-root registry."
		}
	};
}
