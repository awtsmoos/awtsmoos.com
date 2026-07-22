// B"H
// Boruch Hashem
// Blessed is He
/**
 * Briah is the creature that was created: not triangles, but named anatomy.
 * The Awtsmoos renews every section and limb while Awtsmoos.com retains stable
 * semantic identity across every disposable Asiyah topology.
 */
import { createUniversalArtifact } from "../../../proceduralObject/foundation/index.js";
import { createAtzilusGenome } from "./AtzilusGenome.js";
import {
	cloneCreatureValue,
	creatureContentHash,
	creatureStableId,
	finiteNumber
} from "../shared/creatureValue.js";

function defaultSections(creatureId, proportions) {
	const count = Math.max(2, Math.min(32, Math.round(finiteNumber(proportions.sections, 5))));
	const length = Math.max(0.1, finiteNumber(proportions.length, 3));
	const radius = Math.max(0.02, finiteNumber(proportions.radius, 0.55));
	return Array.from({ length: count }, (_, index) => {
		const amount = index / (count - 1);
		const taper = 0.62 + Math.sin(amount * Math.PI) * 0.38;
		return {
			id: creatureStableId("axis.section", { creatureId, role: "torso", index }),
			position: [0, amount * length, 0],
			ellipticalRadius: [radius * taper, radius * taper * 0.82],
			roll: 0,
			taper,
			stiffness: 0.55,
			massContribution: taper,
			surfaceProfile: "elliptical",
			anatomicalTags: index === 0 ? ["posterior"] : index === count - 1 ? ["anterior"] : ["torso"],
			materialRegion: "body.base",
			localDeformationLimits: { bend: 0.75, stretch: 1.5, compression: 0.55 }
		};
	});
}

/** Seals a Briah document with deterministic revision and content identity. */
export function sealBriahCreature(input, revision = input.revision ?? 0, provenance = {}) {
	const document = cloneCreatureValue({ ...input, revision, provenance: { ...(input.provenance || {}), ...provenance } });
	document.contentHash = creatureContentHash(document);
	return Object.freeze(document);
}

/** Compiles Atzilus intent into the primary editable Briah artifact. */
export function compileAtzilusGenome(input = {}) {
	const atzilusGenome = input.type === "atzilus-genome" ? input : createAtzilusGenome(input);
	const id = creatureStableId("briah.creature", { genomeId: atzilusGenome.id, seed: atzilusGenome.seed });
	const sections = defaultSections(id, atzilusGenome.axialProportions);
	return sealBriahCreature({
		id,
		type: "briah-creature",
		version: "1.0.0",
		revision: 0,
		seed: atzilusGenome.seed,
		body: { axialGraphId: creatureStableId("axis.graph", { creatureId: id }), sections, branches: [] },
		parts: [],
		limbs: [],
		symmetryGroups: [],
		attachments: [],
		materialLayers: [],
		behaviorProfile: cloneCreatureValue(atzilusGenome.functionalTraits),
		metadata: { speciesFamily: cloneCreatureValue(atzilusGenome.speciesFamilyMetadata) },
		provenance: { atzilusGenomeId: atzilusGenome.id, atzilusGenomeHash: atzilusGenome.contentHash }
	});
}

/** Wraps Briah in the existing immutable universal-artifact foundation. */
export function createBriahCreatureArtifact(briahCreature) {
	return createUniversalArtifact({
		id: briahCreature.id,
		schema: "awtsmoos.briah-creature",
		schemaVersion: briahCreature.version,
		revision: briahCreature.revision,
		parentRevision: briahCreature.revision > 0 ? briahCreature.revision - 1 : null,
		payload: briahCreature,
		provenance: briahCreature.provenance,
		metadata: briahCreature.metadata
	});
}
