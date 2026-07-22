// B"H
// Boruch Hashem
// Blessed is He
/**
 * Paint belongs to anatomy rather than yesterday's vertices. The Awtsmoos
 * renews each coat after remeshing while Awtsmoos.com preserves semantic masks.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import {
	cloneCreatureValue,
	creatureContentHash,
	creatureStableId
} from "../shared/creatureValue.js";

function revise(creature, materialLayers, operation) {
	return sealBriahCreature(
		{
			...creature,
			materialLayers
		},
		creature.revision + 1,
		{
			parentContentHash: creature.contentHash,
			lastOperation: operation
		}
	);
}

/** Adds a deterministic base, coat, detail, or custom material recipe. */
export function addMaterialLayer(creature, input = {}) {
	const role = input.role || (
		creature.materialLayers.length === 0 ? "base" : "detail"
	);
	const layer = {
		id: input.id || creatureStableId("material.layer", {
			creatureId: creature.id,
			role,
			ordinal: creature.materialLayers.length
		}),
		role,
		blendMode: input.blendMode || "normal",
		opacity: Number.isFinite(input.opacity)
			? Math.max(0, Math.min(1, input.opacity))
			: 1,
		pattern: cloneCreatureValue(input.pattern || { type: "solid" }),
		palette: cloneCreatureValue(input.palette || ["#808080"]),
		mask: cloneCreatureValue(input.mask || {
			type: "semantic-region",
			regions: ["body.base"]
		}),
		regionOverrides: cloneCreatureValue(input.regionOverrides || {})
	};
	return revise(
		creature,
		[...creature.materialLayers, layer],
		"creature.material.layer.add"
	);
}

/** Removes, reorders, or edits one semantic material recipe. */
export function editMaterialLayers(creature, input = {}, action = "pattern.set") {
	let layers = cloneCreatureValue(creature.materialLayers);
	if (action === "remove") {
		layers = layers.filter((layer) => layer.id !== input.layerId);
	} else if (action === "reorder") {
		const oldIndex = layers.findIndex((layer) => layer.id === input.layerId);
		const [layer] = oldIndex >= 0 ? layers.splice(oldIndex, 1) : [];
		if (layer) {
			const newIndex = Math.max(0, Math.min(layers.length, input.index));
			layers.splice(newIndex, 0, layer);
		}
	} else {
		const key = action.startsWith("pattern")
			? "pattern"
			: action.startsWith("palette")
				? "palette"
				: action.startsWith("mask")
					? "mask"
					: "regionOverrides";
		const value = input.value
			?? input.pattern
			?? input.palette
			?? input.mask
			?? input.override;
		layers = layers.map((layer) => layer.id === input.layerId
			? {
				...layer,
				[key]: cloneCreatureValue(value)
			}
			: layer);
	}
	return revise(
		creature,
		layers,
		`creature.material.layer.${action}`
	);
}

/** Compiles semantic masks into renderer-neutral procedural material artifacts. */
export function compileCreatureMaterials(creature) {
	const materials = creature.materialLayers.map((layer, order) => ({
		id: layer.id,
		order,
		shaderModel: "procedural-pbr",
		role: layer.role,
		blendMode: layer.blendMode,
		opacity: layer.opacity,
		pattern: cloneCreatureValue(layer.pattern),
		palette: cloneCreatureValue(layer.palette),
		semanticMask: cloneCreatureValue(layer.mask),
		regionOverrides: cloneCreatureValue(layer.regionOverrides)
	}));
	const artifact = {
		type: "creature-material-artifacts",
		version: "1.0.0",
		materials,
		proceduralCoordinates: [
			"body-axis",
			"triplanar",
			"curvature",
			"landmark-distance"
		],
		sourceBriahHash: creature.contentHash
	};
	artifact.contentHash = creatureContentHash(artifact);
	return Object.freeze(artifact);
}
