// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Four Worlds meet without confusion: Briah remains truth, Yetzirah forms,
 * and Asiyah renders. The Awtsmoos creates all at once; Awtsmoos.com composes
 * existing vessels so no rival compiler can claim an independent kingdom.
 */
import { compileCreatureMaterials } from "./materialOperations.js";
import { synthesizeYetzirahRig } from "./rigSynthesis.js";
import { validateYetzirahRig } from "./rigValidation.js";
import { validateBriahCreature } from "./validation.js";
import { deriveCreatureContentHash } from "./identity.js";
import { compileCreatureLods, compileCreatureMesh } from "./meshCompiler.js";
import {
	bindCreatureSkin,
	createPositionedCreatureRig,
	validateSkinWeights
} from "./skinCompiler.js";
import { createCreatureCollisionShapes } from "./compile/createCollisionShapes.js";
import { createCreatureMemoryReport } from "./compile/createMemoryReport.js";
import { createAsiyahCreatureArtifacts } from "./worlds/AsiyahCreatureArtifacts.js";
import { evaluateCreatureCapabilities } from "./capabilityCompiler.js";
import { estimateCreatureBudget } from "./budgetCompiler.js";

function requireValid(report, stage) {
	if (!report.valid) {
		const error = new Error(`B"H | Creature ${stage} validation failed.`);
		error.code = `CREATURE.${stage.toUpperCase()}_INVALID`;
		error.diagnostics = report.errors;
		throw error;
	}
}

export function compileCreatureArtifacts(creature, options = {}) {
	const startedAt = Date.now();
	requireValid(validateBriahCreature(creature), "anatomy");
	const rig = synthesizeYetzirahRig(creature, options.previousRig || null);
	requireValid(validateYetzirahRig(rig), "rig");
	const mesh = compileCreatureMesh(creature, options);
	const skinning = bindCreatureSkin(mesh, rig, options.skinning || {});
	requireValid(validateSkinWeights(skinning), "skin");
	const materialValue = compileCreatureMaterials(creature);
	const materials = Object.freeze({
		...materialValue,
		contentHash: deriveCreatureContentHash(materialValue)
	});
	const lodSet = compileCreatureLods(mesh, options);
	const memoryReport = createCreatureMemoryReport(
		skinning.parts,
		startedAt,
		options.deterministic !== false
	);
	const positionedRig = createPositionedCreatureRig(rig);
	const preservationReport = {
		materials: "preserved-by-semantic-recipes",
		uvs: "regenerated-from-anatomical-coordinates",
		skinWeights: "generated-from-yetzirah-lineage",
		semanticRegions: "preserved",
		stableReferences: "preserved-or-reported-by-rig-lineage"
	};
	const asiyahCreatureArtifacts = createAsiyahCreatureArtifacts({
		briahCreature: creature,
		yetzirahRig: rig,
		mesh: { parts: skinning.parts, summary: mesh.summary },
		skinning,
		materials,
		proceduralCoordinates: ["body-axis", "semantic-region"],
		collisionShapes: createCreatureCollisionShapes(positionedRig, creature),
		lods: lodSet.levels,
		exportArtifacts: { rendererNeutral: true, typedArrays: true, formats: ["awtsmoos-creature-artifact", "gltf-adapter-ready"] },
		memoryReport,
		preservationReport
	});
	const artifacts = { mesh: { parts: skinning.parts }, yetzirahRig: rig, skinning, memoryReport };
	return Object.freeze({
		briahCreature: creature,
		yetzirahRig: rig,
		asiyahMesh: mesh,
		skinning,
		materials,
		lodSet,
		capabilities: evaluateCreatureCapabilities(creature, rig),
		budget: estimateCreatureBudget(creature, artifacts),
		asiyahCreatureArtifacts
	});
}
