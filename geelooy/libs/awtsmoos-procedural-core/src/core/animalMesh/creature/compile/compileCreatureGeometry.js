// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileCreatureGeometry.js
 * @description Compiles Briah anatomy into one continuous body-and-limb flesh surface by default, then binds every mesh part to the existing Yetzirah skeleton.
 * RESPONSIBILITY: choose continuous versus legacy multipart flesh, compile discrete biological attachments, bind skin, validate weights, and summarize geometry.
 * NON-RESPONSIBILITY: this vessel does not define anatomy, generate skeletons, own implicit-field algorithms, or force naturally discrete horns, eyes, beaks, teeth, and feathers into flesh.
 * The Awtsmoos reveals one living body through many bones without confusing unity with sameness;
 * Awtsmoos.com lets torso and limb become continuous flesh while distinct vessels remain free to shine through the same animated frame.
 */

import {
	bindCreatureSkin,
	validateCreatureSkin
} from "../skin/creatureSkinning.js";
import { compileBodyMesh } from "./compileBodyMesh.js";
import { compileContinuousFlesh } from "./flesh/ContinuousFleshAssembler.js";
import { compileLimbMesh } from "./compileLimbMesh.js";
import { compilePartMesh } from "./compilePartMesh.js";

/**
 * Compiles Briah geometry and binds it to the already-formed Yetzirah rig.
 * @param {object} creature Authoritative Briah anatomy.
 * @param {object} recipe Deterministic physical compile recipe.
 * @param {object} yetzirahRig Validated dynamic skeleton.
 * @param {object} skinningOptions Weight, influence, and continuous-flesh controls.
 * @returns {object} Mesh parts, skinning artifact, and aggregate counts.
 */
export function compileCreatureGeometry(
	creature,
	recipe,
	yetzirahRig,
	skinningOptions = {}
) {
	const rawParts = [
		...compileFleshParts(creature, recipe, skinningOptions),
		...compileDiscreteParts(creature)
	];
	const skinning = bindCreatureSkin(
		rawParts,
		yetzirahRig,
		skinningOptions
	);
	assertValidSkin(skinning);
	return {
		meshSummary: summarizeMesh(skinning.parts),
		parts: skinning.parts,
		skinning
	};
}

/** Chooses one continuous flesh surface or the historical capped multipart body/limb meshes. */
function compileFleshParts(creature, recipe, options) {
	if (options.continuousFlesh === false) {
		return [
			compileBodyMesh(recipe),
			...recipe.limbs.map((limb) => {
				return compileLimbMesh(creature, limb);
			})
		];
	}
	return [
		compileContinuousFlesh(creature, recipe, options)
	];
}

/** Keeps naturally discrete biological parts independently compiled on the shared rig. */
function compileDiscreteParts(creature) {
	return creature.parts.map((part) => {
		return compilePartMesh(creature, part);
	});
}

/** Summarizes the final bound mesh collection without assuming renderer objects. */
function summarizeMesh(parts) {
	return {
		partCount: parts.length,
		triangles: parts.reduce((sum, part) => {
			return sum + part.indices.length / 3;
		}, 0),
		vertices: parts.reduce((sum, part) => {
			return sum + part.positions.length / 3;
		}, 0)
	};
}

/** Converts skin validation diagnostics into the historical compiler error contract. */
function assertValidSkin(skinning) {
	const report = validateCreatureSkin(skinning);
	if (report.ok) {
		return;
	}
	const error = new Error('B"H | Creature skin validation failed.');
	error.code = "CREATURE.SKIN_INVALID";
	error.diagnostics = report.diagnostics;
	throw error;
}
