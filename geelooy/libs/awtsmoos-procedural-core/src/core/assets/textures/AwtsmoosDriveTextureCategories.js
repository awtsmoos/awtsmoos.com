// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureCategories.js
 * @description Derives the AI-facing category tree directly from semantic rules so taxonomy cannot drift behind discovery.
 * Awtsmoos.com preserves legacy navigation aliases while every new rule automatically becomes inspectable by category and subcategory.
 */

import { classifyAwtsmoosDriveTextureSemantics } from './AwtsmoosDriveTextureSemantics.js';
import { AWTSMOOS_MADE_TEXTURE_RULES } from './AwtsmoosDriveTextureSemanticRulesMade.js';
import { AWTSMOOS_NATURAL_TEXTURE_RULES } from './AwtsmoosDriveTextureSemanticRulesNatural.js';
import { AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS } from './AwtsmoosDriveTextureTaxonomyLabels.js';

const RULES = Object.freeze([
	...AWTSMOOS_NATURAL_TEXTURE_RULES,
	...AWTSMOOS_MADE_TEXTURE_RULES
]);
const TREE = buildCategoryTree(RULES);

export const AWTSMOOS_DRIVE_TEXTURE_TAXONOMY = Object.freeze(
	Object.entries(TREE).flatMap(([category, children]) => {
		return Object.keys(children).map(subcategory => Object.freeze({ category, subcategory }));
	})
);

/** Returns overlapping semantics while preserving legacy primary category fields. */
export function classifyAwtsmoosDriveTexture(record = {}) {
	return classifyAwtsmoosDriveTextureSemantics(record);
}

/** Returns the complete category map for AI planning and inspection. */
export function awtsmoosDriveTextureCategoryTree() {
	return TREE;
}

function buildCategoryTree(rules) {
	const mutable = {};
	for (const rule of rules) {
		for (const category of rule.categories) {
			mutable[category] ||= {};
			for (const subcategory of rule.subcategories) {
				mutable[category][subcategory] = subcategoryDescription(subcategory);
			}
		}
	}
	mutable.water ||= {};
	mutable.water.surface ||= 'Water surfaces';
	return freezeTree(mutable);
}

function subcategoryDescription(subcategory) {
	return AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS[subcategory]
		|| subcategory.replaceAll('-', ' ');
}

function freezeTree(tree) {
	return Object.freeze(Object.fromEntries(
		Object.entries(tree)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([category, children]) => [
				category,
				Object.freeze(Object.fromEntries(
					Object.entries(children).sort(([left], [right]) => left.localeCompare(right))
				))
			])
	));
}
