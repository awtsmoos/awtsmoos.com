// B"H
// Boruch Hashem
// Blessed is He
/**
 * Atzilus carries creature intent before form. The Awtsmoos gives heredity a
 * bounded voice here, while Awtsmoos.com geometry remains wholly absent.
 */
import { createAnimalGenome } from "../../morphology/animalGenome.js";
import {
	cloneCreatureValue,
	creatureContentHash,
	creatureStableId,
	finiteNumber
} from "../shared/creatureValue.js";

/**
 * Creates immutable high-level hereditary intent.
 * Determinism: seeded. Side effects: none. Geometry ownership: forbidden.
 */
export function createAtzilusGenome(input = {}) {
	const seed = finiteNumber(input.seed, 1) >>> 0;
	const inherited = createAnimalGenome({
		seed,
		archetypeId: input.speciesFamilyMetadata?.familyId || input.archetypeId || "custom",
		genes: input.morphologicalTraits || input.traits || {}
	});
	const genome = {
		id: input.id || creatureStableId("atzilus.genome", { seed, inherited: inherited.id }),
		type: "atzilus-genome",
		version: "1.0.0",
		seed,
		bodyPlanTendencies: cloneCreatureValue(input.bodyPlanTendencies || { primary: "custom" }),
		morphologicalTraits: cloneCreatureValue({ ...inherited.traits, ...(input.morphologicalTraits || {}) }),
		limbCountRanges: cloneCreatureValue(input.limbCountRanges || { support: [0, 12], manipulation: [0, 8] }),
		axialProportions: cloneCreatureValue(input.axialProportions || { length: 3, radius: 0.55, sections: 5 }),
		symmetryPreferences: cloneCreatureValue(input.symmetryPreferences || { mode: "bilateral", exact: true }),
		functionalTraits: cloneCreatureValue(input.functionalTraits || {}),
		mutationLocks: cloneCreatureValue(input.mutationLocks || []),
		speciesFamilyMetadata: cloneCreatureValue(input.speciesFamilyMetadata || { familyId: inherited.archetype_id }),
		legacyAnimalGenome: inherited
	};
	genome.contentHash = creatureContentHash(genome);
	return Object.freeze(genome);
}
