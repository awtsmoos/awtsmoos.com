// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahHardAppendageDefinitions.js
 * @description Defines reusable keratin spikes, stingers, quills, and defensive spines without assigning them permanently to one animal.
 * The Awtsmoos reveals hardness as one garment of form, while Awtsmoos.com keeps spur and stinger free to move through every frame;
 * Gevurah gives each point a bounded taper, so beast, fish, insect, plant-like chimera, armor, or wall may bear the same lawful flame.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates a generic keratin spike suitable for arbitrary placement. */
export function createGevurahKeratinSpikeDefinition(variant = "spike", overrides = {}) {
	return hard(variant, "keratin-spike", { length: 0.12, radius: 0.018, curve: 0.12, taper: 0.96, ...overrides });
}

/** Creates a slender stinger with strong terminal taper. */
export function createGevurahStingerDefinition(overrides = {}) {
	return hard("stinger", "stinger", { length: 0.16, radius: 0.014, curve: 0.08, taper: 0.985, ...overrides }, { venomDelivery: true });
}

/** Creates a quill that may be arrayed later through ordinary feature composition. */
export function createGevurahQuillDefinition(overrides = {}) {
	return hard("quill", "quill", { length: 0.2, radius: 0.01, curve: 0.04, taper: 0.99, ...overrides });
}

/** Creates a dorsal/defensive spine independently of any fish, reptile, or fantasy archetype. */
export function createGevurahSpineDefinition(overrides = {}) {
	return hard("spine", "spine", { length: 0.18, radius: 0.016, curve: 0.1, taper: 0.98, ...overrides });
}

/** Creates one hard appendage through the explicit curved-spike recipe. */
function hard(id, category, parameters, capabilities = {}) {
	return createBiologicalDefinition({
		id: `biology.hard-appendage.${id}`,
		category,
		geometryRecipe: "curved-keratin-spike",
		parameters,
		materialRegions: ["keratin.hard-appendage"],
		capabilities: { defense: true, ...capabilities },
		metadata: { independentlyAttachable: true }
	});
}
