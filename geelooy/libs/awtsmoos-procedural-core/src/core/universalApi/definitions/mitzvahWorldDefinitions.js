// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { IDENTIFIED_OBJECT_SCHEMA } from "./commonSchemas.js";
import { createResource } from "../resourceOperations.js";

const CHOSSID_PATH = "/games/mitzvahWorld/assets/models/player/chossid.glb";

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

/** First domain bridges layered over the generic resource/runtime foundation. */
export function createMitzvahWorldDefinitions() {
	const human = creator("humans.create", "humans", "human", {
		model: { assetId: "chossid.glb", source: CHOSSID_PATH },
		transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
		rig: { type: "humanoid" },
		actions: [],
		behavior: {}
	});
	human.execute = (context, params) => createResource(context, "humans", {
		model: params.modelId
			? { assetId: params.modelId }
			: { assetId: "chossid.glb", source: CHOSSID_PATH },
		transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
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
		creator("water.create", "waters", "water", {
			waterType: "lake",
			material: {
				source: "procedural-fallback",
				reason: "No repository water normal was available in the audited in-root registry."
			}
		}),
		creator("water.createRiver", "waters", "water", {
			waterType: "river",
			material: {
				source: "procedural-fallback",
				reason: "No repository water normal was available in the audited in-root registry."
			}
		})
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
