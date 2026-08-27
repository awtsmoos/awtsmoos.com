// B"H
// Boruch Hashem
// Blessed is He

import {
	bindCreatureSkin,
	validateCreatureSkin
} from "../skin/creatureSkinning.js";
import { compileBodyMesh } from "./compileBodyMesh.js";
import { compileLimbMesh } from "./compileLimbMesh.js";
import { compilePartMesh } from "./compilePartMesh.js";

function summarizeMesh(parts) {
	return {
		partCount: parts.length,
		vertices: parts.reduce(
			(sum, part) => sum + part.positions.length / 3,
			0
		),
		triangles: parts.reduce(
			(sum, part) => sum + part.indices.length / 3,
			0
		)
	};
}

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

/**
 * Compiles Briah geometry and binds it to the already-formed Yetzirah rig.
 * @param {Object} creature - Authoritative Briah anatomy.
 * @param {Object} recipe - Deterministic physical compile recipe.
 * @param {Object} yetzirahRig - Validated dynamic skeleton.
 * @param {Object} skinningOptions - Weight and influence policy.
 * @returns {Object} Mesh parts, skinning artifact, and aggregate counts.
 * @deterministic Always for equal inputs.
 * @sideEffects None.
 */
export function compileCreatureGeometry(
	creature,
	recipe,
	yetzirahRig,
	skinningOptions = {}
) {
	const rawParts = [
		compileBodyMesh(recipe),
		...recipe.limbs.map(
			(limb) => compileLimbMesh(creature, limb)
		),
		...creature.parts.map(
			(part) => compilePartMesh(creature, part)
		)
	];
	const skinning = bindCreatureSkin(
		rawParts,
		yetzirahRig,
		skinningOptions
	);
	assertValidSkin(skinning);
	return {
		parts: skinning.parts,
		skinning,
		meshSummary: summarizeMesh(skinning.parts)
	};
}
