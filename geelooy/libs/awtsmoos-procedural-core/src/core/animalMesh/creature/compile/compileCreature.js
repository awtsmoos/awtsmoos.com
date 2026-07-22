// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Four Worlds descend here without confusion. The Awtsmoos lowers Briah
 * through existing loft and weight vessels into Awtsmoos.com typed Asiyah output.
 */
import { validateBriahCreature } from "../validation/GevurahAnatomyConstraints.js";
import { synthesizeYetzirahRig } from "../rig/synthesizeYetzirahRig.js";
import { validateYetzirahRig } from "../rig/rigDiagnostics.js";
import {
	bindCreatureSkin,
	validateCreatureSkin
} from "../skin/creatureSkinning.js";
import { compileCreatureMaterials } from "../materials/materialLayers.js";
import { createAsiyahCreatureArtifacts } from "../worlds/AsiyahCreatureArtifacts.js";
import { compileBriahRecipe } from "./compileBriahRecipe.js";
import { compileBodyMesh } from "./compileBodyMesh.js";
import { compileLimbMesh } from "./compileLimbMesh.js";
import { compilePartMesh } from "./compilePartMesh.js";
import { createCreatureCollisionShapes } from "./createCollisionShapes.js";
import { createCreatureLodSet } from "./createLodSet.js";
import { createCreatureMemoryReport } from "./createMemoryReport.js";

function assertValid(report, stage) {
	if (!report.ok) {
		const error = new Error(`B"H | Creature ${stage} validation failed.`);
		error.code = `CREATURE.${stage.toUpperCase()}_INVALID`;
		error.diagnostics = report.diagnostics;
		throw error;
	}
}

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

/**
 * Compiles Briah deterministically into Yetzirah and Asiyah artifacts.
 * Failure behavior: throws before returning partial output.
 */
export function compileCreature(creature, options = {}) {
	const startedAt = Date.now();
	assertValid(
		validateBriahCreature(creature, { limits: options.semanticLimits }),
		"anatomy"
	);
	const yetzirahRig = synthesizeYetzirahRig(creature, {
		previousRig: options.previousRig
	});
	assertValid(validateYetzirahRig(yetzirahRig), "rig");
	const recipe = compileBriahRecipe(creature, yetzirahRig, options);
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
		options.skinning || {}
	);
	assertValid(validateCreatureSkin(skinning), "skin");
	const parts = skinning.parts;
	const meshSummary = summarizeMesh(parts);
	const materials = compileCreatureMaterials(creature);
	return createAsiyahCreatureArtifacts({
		briahCreature: creature,
		yetzirahRig,
		mesh: {
			parts,
			summary: meshSummary
		},
		skinning,
		materials,
		proceduralCoordinates: materials.proceduralCoordinates,
		collisionShapes: createCreatureCollisionShapes(
			yetzirahRig,
			creature
		),
		lods: createCreatureLodSet(
			meshSummary,
			creature.contentHash,
			options.lodRatios
		),
		exportArtifacts: {
			rendererNeutral: true,
			typedArrays: true,
			formats: [
				"awtsmoos-creature-artifact",
				"gltf-adapter-ready"
			]
		},
		memoryReport: createCreatureMemoryReport(
			parts,
			startedAt,
			options.deterministic !== false
		),
		preservationReport: {
			materials: "preserved-by-semantic-mask",
			uvs: "procedural-coordinates-preserved",
			morphTargets: "none-requested",
			skinWeights: options.previousRig
				? "recalculated-with-lineage"
				: "generated",
			semanticRegions: "preserved",
			stableReferences: "preserved-or-reported-by-rig-lineage",
			customAttributes: "preserved-when-semantic"
		}
	});
}
