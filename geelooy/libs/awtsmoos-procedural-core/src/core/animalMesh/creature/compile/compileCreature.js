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
import { compileCreatureMaterials } from "../materials/materialLayers.js";
import { createAsiyahCreatureArtifacts } from "../worlds/AsiyahCreatureArtifacts.js";
import { compileBriahRecipe } from "./compileBriahRecipe.js";
import { compileCreatureGeometry } from "./compileCreatureGeometry.js";
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
	const {
		parts,
		skinning,
		meshSummary
	} = compileCreatureGeometry(
		creature,
		recipe,
		yetzirahRig,
		options.skinning || {}
	);
	const materials = compileCreatureMaterials(creature);
	return createAsiyahCreatureArtifacts({
		briahCreature: creature,
		yetzirahRig,
		mesh: { parts, summary: meshSummary },
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
