// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { CreatureOperationError } from "./contracts.js";
import { createSemanticId } from "./identity.js";

function requireLayer(creature, layerId) {
	const layer = creature.materialLayers.find((candidate) => candidate.id === layerId);
	if (!layer) {
		throw new CreatureOperationError("CREATURE_MATERIAL_LAYER_NOT_FOUND", `Unknown material layer: ${layerId}`);
	}
	return layer;
}

/**
 * Edits procedural material recipes in anatomical coordinates. Paint belongs to
 * meaning—dorsal, ventral, landmark distance, body axis, semantic region—not to
 * a temporary UV triangle, so Asiyah may be rebuilt while the color intent lives.
 * @param {Object} creature - Transaction-local Briah document.
 * @param {string} operation - Material operation name.
 * @param {Object} argumentsValue - Layer recipe arguments.
 * @returns {Object} Updated material state.
 */
export function applyMaterialOperation(creature, operation, argumentsValue = {}) {
	if (operation === "creature.material.layer.add") {
		const layer = {
			id: argumentsValue.id || createSemanticId("material-layer", creature.id, creature.revision, creature.materialLayers.length),
			role: argumentsValue.role || (creature.materialLayers.length ? "detail" : "base"),
			pattern: cloneCreatureValue(argumentsValue.pattern || { type: "solid" }),
			palette: cloneCreatureValue(argumentsValue.palette || [[0.5, 0.5, 0.5, 1]]),
			mask: cloneCreatureValue(argumentsValue.mask || { type: "all" }),
			mapping: cloneCreatureValue(argumentsValue.mapping || { type: "body-axis" }),
			blendMode: argumentsValue.blendMode || "normal",
			opacity: Number(argumentsValue.opacity ?? 1),
			regionOverrides: {}
		};
		creature.materialLayers.push(layer);
		return { materialLayer: layer };
	}
	if (operation === "creature.material.layer.remove") {
		creature.materialLayers = creature.materialLayers.filter((layer) => layer.id !== argumentsValue.layerId);
		return { removedLayerId: argumentsValue.layerId };
	}
	const layer = requireLayer(creature, argumentsValue.layerId);
	if (operation === "creature.material.layer.reorder") {
		creature.materialLayers = creature.materialLayers.filter((candidate) => candidate.id !== layer.id);
		creature.materialLayers.splice(Math.max(0, Number(argumentsValue.index)), 0, layer);
	} else if (operation === "creature.material.layer.pattern.set") {
		layer.pattern = cloneCreatureValue(argumentsValue.pattern);
	} else if (operation === "creature.material.layer.palette.set") {
		layer.palette = cloneCreatureValue(argumentsValue.palette);
	} else if (operation === "creature.material.layer.mask.set") {
		layer.mask = cloneCreatureValue(argumentsValue.mask);
	} else if (operation === "creature.material.region.override") {
		layer.regionOverrides[argumentsValue.regionId] = cloneCreatureValue(argumentsValue.override);
	} else {
		throw new CreatureOperationError("CREATURE_MATERIAL_OPERATION_UNKNOWN", `Unsupported material edit: ${operation}`);
	}
	return { materialLayer: layer };
}

export function compileCreatureMaterials(creature) {
	return {
		type: "procedural-creature-materials",
		coordinateSource: "semantic-anatomy",
		layers: cloneCreatureValue(creature.materialLayers),
		semanticRegions: cloneCreatureValue(creature.semanticRegions),
		uvDependency: "optional-output-only"
	};
}
