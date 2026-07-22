// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { CREATURE_VERSION, CREATURE_WORLD_TYPES } from "./contracts.js";
import { createSemanticId, deriveCreatureContentHash } from "./identity.js";

function createBodySection(creatureId, index, count) {
	const normalized = count <= 1 ? 0 : index / (count - 1);
	const axialPosition = normalized * 2 - 1;
	const breadth = 0.55 + Math.sin(normalized * Math.PI) * 0.45;
	return {
		id: createSemanticId("section", creatureId, index),
		position: [axialPosition, 0, 0],
		ellipticalRadius: [breadth, breadth * 0.82],
		roll: 0,
		taper: 1,
		stiffness: 0.65,
		massContribution: breadth,
		surfaceProfile: "elliptical",
		anatomicalTags: [normalized < 0.34 ? "posterior" : normalized > 0.66 ? "anterior" : "torso"],
		materialRegion: "body.base",
		localDeformationLimits: { bend: 0.8, stretch: 1.8, scale: [0.15, 4] }
	};
}

/**
 * Creates hereditary Atzilus intent without renderer-owned geometry.
 * @param {Object} [options] - Seed, tendencies, traits, locks, and family metadata.
 * @returns {Object} Canonical AtzilusGenome.
 * @complexity O(1) plus input cloning.
 * @deterministic Always for equal options.
 * @sideEffects None.
 */
export function createAtzilusGenome(options = {}) {
	const seed = Number.isSafeInteger(options.seed) ? options.seed : 1;
	return {
		id: options.id || createSemanticId("atzilus-genome", seed, options.speciesFamily || "novel"),
		type: CREATURE_WORLD_TYPES.atzilus,
		version: CREATURE_VERSION,
		seed,
		bodyPlanTendencies: cloneCreatureValue(options.bodyPlanTendencies || {}),
		morphologicalTraits: cloneCreatureValue(options.morphologicalTraits || {}),
		limbCountRanges: cloneCreatureValue(options.limbCountRanges || {}),
		axialProportions: cloneCreatureValue(options.axialProportions || {}),
		symmetryPreferences: cloneCreatureValue(options.symmetryPreferences || { primary: "bilateral" }),
		functionalTraits: cloneCreatureValue(options.functionalTraits || {}),
		mutationLocks: cloneCreatureValue(options.mutationLocks || []),
		speciesFamilyMetadata: cloneCreatureValue(options.speciesFamilyMetadata || {})
	};
}

/**
 * Compiles Atzilus intent into the authoritative editable Briah document.
 * @param {Object} genome - AtzilusGenome.
 * @returns {Object} Stable-ID BriahCreature.
 * @complexity O(s), where s is initial axial section count.
 * @deterministic Always for an equal genome.
 * @sideEffects None.
 */
export function compileGenomeToBriah(genome) {
	const sectionCount = Math.max(3, Math.floor(genome.axialProportions?.sectionCount || 5));
	const creatureId = createSemanticId("briah-creature", genome.id, genome.seed);
	const creature = {
		id: creatureId,
		type: CREATURE_WORLD_TYPES.briah,
		version: CREATURE_VERSION,
		revision: 1,
		seed: genome.seed,
		contentHash: "",
		body: {
			axialGraphId: createSemanticId("axis-main", creatureId),
			sections: Array.from({ length: sectionCount }, (_, index) => createBodySection(creatureId, index, sectionCount)),
			branches: []
		},
		parts: [],
		limbs: [],
		symmetryGroups: [],
		attachments: [],
		materialLayers: [],
		behaviorProfile: cloneCreatureValue(genome.functionalTraits || {}),
		semanticRegions: [{ id: "body.base", role: "body.primary" }],
		metadata: { speciesFamily: cloneCreatureValue(genome.speciesFamilyMetadata || {}) },
		provenance: { genomeId: genome.id, operations: [] }
	};
	return refreshBriahCreature(creature, false);
}

/**
 * Recomputes immutable identity evidence after an anatomical edit.
 * @param {Object} creature - Briah document to refresh.
 * @param {boolean} [incrementRevision=true] - Whether to advance revision.
 * @returns {Object} Refreshed independent Briah document.
 */
export function refreshBriahCreature(creature, incrementRevision = true) {
	const refreshed = cloneCreatureValue(creature);
	if (incrementRevision) {
		refreshed.revision += 1;
	}
	refreshed.contentHash = "";
	refreshed.contentHash = deriveCreatureContentHash(refreshed);
	return refreshed;
}
