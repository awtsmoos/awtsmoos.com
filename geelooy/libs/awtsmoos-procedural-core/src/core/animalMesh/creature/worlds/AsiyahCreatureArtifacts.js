// B"H
// Boruch Hashem
// Blessed is He
/**
 * Asiyah is concrete and replaceable. The Awtsmoos reveals meshes, weights,
 * collisions, LODs, and exports while Awtsmoos.com keeps Briah editable truth.
 */
import {
	creatureContentHash,
	creatureStableId
} from "../shared/creatureValue.js";

/** Seals physical outputs with explicit preservation and memory reports. */
export function createAsiyahCreatureArtifacts(input) {
	const artifact = {
		id: creatureStableId("asiyah.creature", {
			briahId: input.briahCreature.id
		}),
		type: "asiyah-creature-artifacts",
		version: "1.0.0",
		sourceBriahId: input.briahCreature.id,
		sourceBriahHash: input.briahCreature.contentHash,
		yetzirahRig: input.yetzirahRig,
		mesh: input.mesh,
		skinning: input.skinning,
		morphTargets: input.morphTargets || [],
		materials: input.materials,
		proceduralCoordinates: input.proceduralCoordinates,
		collisionShapes: input.collisionShapes,
		lods: input.lods,
		renderAdapterArtifacts: input.renderAdapterArtifacts || [],
		exportArtifacts: input.exportArtifacts,
		memoryReport: input.memoryReport,
		preservationReport: input.preservationReport
	};
	artifact.contentHash = creatureContentHash({
		sourceBriahHash: artifact.sourceBriahHash,
		rigHash: artifact.yetzirahRig.contentHash,
		meshSummary: artifact.mesh.summary,
		materialsHash: artifact.materials.contentHash,
		lods: artifact.lods
	});
	return Object.freeze(artifact);
}
