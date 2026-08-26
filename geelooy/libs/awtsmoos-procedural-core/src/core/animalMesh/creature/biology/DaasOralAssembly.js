// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DaasOralAssembly.js
 * @description Composes lips, gum beds, dentition arches, tongue, and palate as independently reusable internal-mouth parts.
 * The Awtsmoos lets speech emerge from a hidden chamber where many organs become one living gate;
 * Awtsmoos.com lets Daas arrange every inner vessel so a human mouth may speak from flesh, rock, tree, or wall without changing its fate.
 */

import {
	createChochmahDentitionDefinition,
	createChochmahGumDefinition,
	createChochmahPalateDefinition
} from "./ChochmahDentalDefinitions.js";
import {
	createMalchusMouthDefinition,
	createMalchusTongueDefinition
} from "./MalchusOralDefinitions.js";
import { createDaasFeaturePlacement } from "./DaasFeatureAssembler.js";

/**
 * Creates a detached oral assembly in normalized local mouth-plane coordinates.
 * @param {object} options Mouth, dentition, tongue, scale, and omission controls.
 * @returns {object} Frozen target-agnostic biological feature assembly.
 */
export function createDaasOralAssembly(options = {}) {
	const scale = positive(options.scale, 1);
	const dentitionVariant = options.dentitionVariant || options.mouthVariant || "human";
	const entries = [];
	entries.push(place(
		createMalchusMouthDefinition(options.mouthVariant || "human", {
			includeTongue: false,
			...(options.mouthParameters || {})
		}),
		"mouth",
		[0, 0, 0],
		scale
	));
	if (options.gums !== false) {
		entries.push(place(createChochmahGumDefinition(), "upper-gum", [0, 0.035, -0.045], scale));
		entries.push(place(createChochmahGumDefinition(), "lower-gum", [0, -0.035, -0.045], scale));
	}
	if (options.teeth !== false) {
		entries.push(place(createChochmahDentitionDefinition(dentitionVariant), "upper-dentition", [0, 0.03, -0.015], scale));
		entries.push(place(createChochmahDentitionDefinition(dentitionVariant), "lower-dentition", [0, -0.03, -0.015], scale));
	}
	if (options.tongue !== false) {
		entries.push(place(createMalchusTongueDefinition(options.tongueVariant || "human"), "tongue", [0, -0.025, -0.075], scale));
	}
	if (options.palate !== false) {
		entries.push(place(createChochmahPalateDefinition(), "palate", [0, 0.045, -0.09], scale));
	}
	return Object.freeze({
		id: options.id || "biology.assembly.oral",
		type: "biological-feature-assembly",
		version: "1.0.0",
		coordinateSpace: "local-mouth-plane",
		entries: Object.freeze(entries),
		metadata: Object.freeze({ targetAgnostic: true, independentlyAttachable: true })
	});
}

/** Creates one stable local placement within the oral assembly. */
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

/** Returns a positive finite scalar or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
