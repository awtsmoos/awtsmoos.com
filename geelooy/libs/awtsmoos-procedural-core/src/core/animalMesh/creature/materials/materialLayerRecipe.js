// B"H
// Boruch Hashem
// Blessed is He

import {
	cloneCreatureValue,
	creatureStableId
} from "../shared/creatureValue.js";

/** Creates one stable semantic material-layer recipe. */
export function createMaterialLayerRecipe(creature, input = {}) {
	const role = input.role || (
		creature.materialLayers.length === 0 ? "base" : "detail"
	);
	return {
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
}

function editedProperty(action) {
	if (action.startsWith("pattern")) {
		return "pattern";
	}
	if (action.startsWith("palette")) {
		return "palette";
	}
	if (action.startsWith("mask")) {
		return "mask";
	}
	return "regionOverrides";
}

/** Applies one immutable edit to a material-layer collection. */
export function applyMaterialLayerEdit(materialLayers, input, action) {
	const layers = cloneCreatureValue(materialLayers);
	if (action === "remove") {
		return layers.filter((layer) => layer.id !== input.layerId);
	}
	if (action === "reorder") {
		const oldIndex = layers.findIndex((layer) => layer.id === input.layerId);
		const [layer] = oldIndex >= 0 ? layers.splice(oldIndex, 1) : [];
		if (layer) {
			const newIndex = Math.max(0, Math.min(layers.length, input.index));
			layers.splice(newIndex, 0, layer);
		}
		return layers;
	}
	const key = editedProperty(action);
	const value = input.value
		?? input.pattern
		?? input.palette
		?? input.mask
		?? input.override;
	return layers.map((layer) => layer.id === input.layerId
		? { ...layer, [key]: cloneCreatureValue(value) }
		: layer);
}
