// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DaasFaceAssembly.js
 * @description Composes reusable eyes, lids, lashes, brows, and delegated center-face anatomy without requiring a biological head.
 * RESPONSIBILITY: arrange the outer face-plane feature set while leaving snout, beak, and oral internals to the center assembly module.
 * NON-RESPONSIBILITY: this file does not compile meshes, own species presets, or hard-code a creature-only target.
 * The Awtsmoos can reveal a face in flesh, tree, rock, or wall;
 * Awtsmoos.com lets Daas arrange sight and expression while deeper mouth vessels answer one centered call.
 */

import { createDaasFaceCenterPlacements } from "./DaasFaceCenterAssembly.js";
import { createDaasFeaturePlacement } from "./DaasFeatureAssembler.js";
import {
	createTiferesEyeDefinition,
	createTiferesEyelashDefinition,
	createTiferesEyebrowDefinition,
	createTiferesEyelidDefinition
} from "./TiferesEyeDefinitions.js";

/**
 * Creates a detached face assembly in normalized local face-plane coordinates.
 * @param {object} options Eye, lid, lash, brow, center-feature, mouth-depth, spacing, and scale controls.
 * @returns {object} Frozen target-agnostic biological feature assembly.
 */
export function createDaasFaceAssembly(options = {}) {
	const eyeVariant = options.eyeVariant || "human";
	const halfSpacing = finitePositive(options.eyeSpacing, 0.34) / 2;
	const scale = finitePositive(options.scale, 1);
	const entries = [];
	appendEye(entries, "left", -halfSpacing, eyeVariant, options, scale);
	appendEye(entries, "right", halfSpacing, eyeVariant, options, scale);
	if (options.brows !== false) {
		appendBrow(entries, "left", -halfSpacing, options, scale);
		appendBrow(entries, "right", halfSpacing, options, scale);
	}
	entries.push(...createDaasFaceCenterPlacements(options, scale));
	return Object.freeze({
		id: options.id || "biology.assembly.face",
		type: "biological-feature-assembly",
		version: "1.0.0",
		coordinateSpace: "local-face-plane",
		entries: Object.freeze(entries),
		metadata: Object.freeze({
			independentlyAttachable: true,
			targetAgnostic: true
		})
	});
}

/**
 * Adds one eye plus optional upper/lower lids and lash field at a local bilateral offset.
 * @param {Array<object>} entries Mutable assembly accumulator local to this construction pass.
 * @param {string} side Left or right assembly slot name.
 * @param {number} x Local face-plane horizontal offset.
 * @param {string} variant Eye morphology family.
 * @param {object} options Optional eye/lid/lash controls.
 * @param {number} scale Shared assembly scale.
 */
function appendEye(entries, side, x, variant, options, scale) {
	entries.push(place(
		createTiferesEyeDefinition(variant, options.eyeParameters),
		side,
		[x, 0.08, 0],
		scale
	));
	if (options.lids !== false) {
		entries.push(place(
			createTiferesEyelidDefinition("upper", options.upperLidParameters),
			`${side}-upper-lid`,
			[x, 0.08, 0.012],
			scale
		));
		entries.push(place(
			createTiferesEyelidDefinition("lower", options.lowerLidParameters),
			`${side}-lower-lid`,
			[x, 0.08, 0.012],
			scale
		));
	}
	if (options.lashes !== false) {
		entries.push(place(
			createTiferesEyelashDefinition(options.lashParameters),
			`${side}-lashes`,
			[x, 0.105, 0.022],
			scale
		));
	}
}

/** Adds one independently parameterized eyebrow field. */
function appendBrow(entries, side, x, options, scale) {
	entries.push(place(
		createTiferesEyebrowDefinition(options.browParameters),
		`${side}-brow`,
		[x, 0.22, 0.018],
		scale
	));
}

/** Creates one stable direct placement within the local face plane. */
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

/** Returns a positive finite scalar or a stable fallback. */
function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
