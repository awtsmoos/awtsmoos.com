// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahDentalDefinitions.js
 * @description Defines standalone teeth, dentition rows, gums, and palatal structures for reusable internal-mouth construction.
 * The Awtsmoos gives Chochmah order inside the hidden chamber of speech and bite;
 * Awtsmoos.com lets tooth, gum, fang, dental pad, and palate serve human, beast, fish, wall, or stranger light.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const TOOTH_VARIANTS = Object.freeze({
	incisor: Object.freeze({ crown: "chisel", length: 0.022, width: 0.009, roots: 1 }),
	canine: Object.freeze({ crown: "conical", length: 0.027, width: 0.008, roots: 1 }),
	molar: Object.freeze({ crown: "cusped", length: 0.018, width: 0.014, roots: 2 }),
	fang: Object.freeze({ crown: "recurved", length: 0.04, width: 0.007, roots: 1 }),
	shark: Object.freeze({ crown: "triangular-serrated", length: 0.035, width: 0.018, roots: 1 }),
	serrated: Object.freeze({ crown: "blade-serrated", length: 0.03, width: 0.01, roots: 1 })
});

/** Creates one independently attachable tooth morphology. */
export function createChochmahToothDefinition(variant = "incisor", overrides = {}) {
	const profile = TOOTH_VARIANTS[variant] || TOOTH_VARIANTS.incisor;
	return createBiologicalDefinition({
		id: `biology.tooth.${variant}`,
		category: "tooth",
		geometryRecipe: "tooth-crown-root",
		parameters: { ...profile, enamelThickness: 0.0012, wear: 0, damage: 0, ...overrides },
		materialRegions: ["tooth.enamel", "tooth.dentin", "tooth.root"],
		capabilities: { biteSurface: true },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates an ordered dentition field such as human, ruminant, shark, or predatory rows. */
export function createChochmahDentitionDefinition(variant = "human", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.dentition.${variant}`,
		category: "dentition",
		geometryRecipe: "dental-arch-array",
		parameters: {
			...dentitionDefaults(variant),
			archCurvature: 0.46,
			spacingVariation: 0.03,
			wear: 0,
			...overrides
		},
		materialRegions: ["tooth.enamel", "tooth.dentin", "gum"],
		animationControls: ["follow-jaw"],
		capabilities: { mastication: true },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a gum bed that may host arbitrary tooth sockets. */
export function createChochmahGumDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.gum.arch",
		category: "gum",
		geometryRecipe: "soft-dental-arch",
		parameters: { width: 0.28, depth: 0.09, thickness: 0.018, socketCount: 16, vascularHint: 0.12, ...overrides },
		materialRegions: ["mouth.gum", "mouth.gum-wet"],
		animationControls: ["follow-jaw"],
		metadata: { independentlyAttachable: true }
	});
}

/** Creates hard/soft palate geometry with optional uvula and rugae detail. */
export function createChochmahPalateDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.palate.general",
		category: "palate",
		geometryRecipe: "oral-roof-surface",
		parameters: { length: 0.16, width: 0.12, hardRatio: 0.68, rugae: 5, uvula: true, softDrop: 0.025, ...overrides },
		materialRegions: ["mouth.hard-palate", "mouth.soft-palate", "mouth.uvula"],
		animationControls: ["swallow", "speech-soft-palate"],
		metadata: { independentlyAttachable: true }
	});
}

/** Returns biologically useful dentition defaults without owning a whole species. */
function dentitionDefaults(variant) {
	if (variant === "ruminant") {
		return { upper: ["dental-pad", "molars"], lower: ["incisors", "molars"], rows: 1 };
	}
	if (variant === "shark") {
		return { upper: ["shark"], lower: ["shark"], rows: 4, replacementRows: 3 };
	}
	if (variant === "predator") {
		return { upper: ["incisor", "canine", "molar"], lower: ["incisor", "canine", "molar"], rows: 1 };
	}
	return { upper: ["incisor", "canine", "premolar", "molar"], lower: ["incisor", "canine", "premolar", "molar"], rows: 1 };
}
