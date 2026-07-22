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
	creatureContentHash
} from "../shared/creatureValue.js";
import {
	applyMaterialLayerEdit,
	createMaterialLayerRecipe
} from "./materialLayerRecipe.js";

function revise(creature, materialLayers, operation) {
	return sealBriahCreature(
		{ ...creature, materialLayers },
		creature.revision + 1,
		{
			parentContentHash: creature.contentHash,
			lastOperation: operation
		}
	);
}

/** Adds a deterministic base, coat, detail, or custom material recipe. */
export function addMaterialLayer(creature, input = {}) {
	const layer = createMaterialLayerRecipe(creature, input);
	return revise(
		creature,
		[...creature.materialLayers, layer],
		"creature.material.layer.add"
	);
}

/** Removes, reorders, or edits one semantic material recipe. */
export function editMaterialLayers(
	creature,
	input = {},
	action = "pattern.set"
) {
	return revise(
		creature,
		applyMaterialLayerEdit(
			creature.materialLayers,
			input,
			action
		),
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
