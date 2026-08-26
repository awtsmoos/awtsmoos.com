// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DaasFaceCenterAssembly.js
 * @description Composes snout, beak, and simple-or-full oral anatomy in the center of a target-agnostic face plane.
 * The Awtsmoos lets one center become muzzle, beak, human speech, or stranger gate without dividing the source;
 * Awtsmoos.com gives each central vessel its own measured place while Daas keeps the larger face on one coherent course.
 */

import {
	createMalchusBeakDefinition,
	createMalchusMouthDefinition,
	createMalchusSnoutDefinition
} from "./MalchusOralDefinitions.js";
import { createDaasFeaturePlacement } from "./DaasFeatureAssembler.js";
import { createDaasOralAssembly } from "./DaasOralAssembly.js";

const MOUTH_OFFSET = Object.freeze([0, -0.27, 0.025]);

/**
 * Creates center-face placements for optional snout, beak, and oral anatomy.
 * @param {object} options Face assembly options.
 * @param {number} scale Shared feature scale.
 * @returns {Array<object>} Detached placement descriptors in local face-plane coordinates.
 */
export function createDaasFaceCenterPlacements(options = {}, scale = 1) {
	const entries = [];
	if (options.snoutVariant) {
		entries.push(place(
			createMalchusSnoutDefinition(options.snoutVariant, options.snoutParameters),
			"snout",
			[0, -0.05, 0.06],
			scale
		));
	}
	if (options.beakVariant) {
		entries.push(place(
			createMalchusBeakDefinition(options.beakVariant, options.beakParameters),
			"beak",
			[0, -0.08, 0.07],
			scale
		));
	}
	if (options.mouth === false) {
		return entries;
	}
	if (options.internalMouth === false) {
		entries.push(place(
			createMalchusMouthDefinition(options.mouthVariant || "human", options.mouthParameters),
			"mouth",
			MOUTH_OFFSET,
			scale
		));
		return entries;
	}
	const oralAssembly = createDaasOralAssembly({
		mouthVariant: options.mouthVariant,
		dentitionVariant: options.dentitionVariant,
		tongueVariant: options.tongueVariant,
		mouthParameters: options.mouthParameters,
		gums: options.gums,
		teeth: options.teeth,
		tongue: options.tongue,
		palate: options.palate,
		scale
	});
	entries.push(...oralAssembly.entries.map((entry) => {
		return offsetPlacement(entry, MOUTH_OFFSET);
	}));
	return entries;
}

/** Creates one direct center-feature placement. */
function place(definition, slot, position, scale) {
	return Object.freeze(createDaasFeaturePlacement(definition, {
		target: "assembly-surface",
		transform: {
			position,
			rotation: [0, 0, 0],
			scale: [scale, scale, scale]
		},
		metadata: { assemblySlot: slot }
	}));
}

/** Offsets one nested oral placement into the containing face plane. */
function offsetPlacement(entry, offset) {
	const position = entry.transform?.position || [0, 0, 0];
	return Object.freeze({
		...entry,
		transform: {
			...entry.transform,
			position: position.map((value, index) => {
				return value + offset[index];
			})
		},
		metadata: {
			...(entry.metadata || {}),
			assemblyParent: "face"
		}
	});
}
