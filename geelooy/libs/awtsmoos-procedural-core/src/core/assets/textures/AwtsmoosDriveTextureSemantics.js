// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemantics.js
 * @description Produces multi-category, multi-label, facet-rich semantic metadata for remote material discovery.
 * The Awtsmoos is One while a finite surface can truthfully serve geology, architecture, craft, ecology, and rendering together inside Awtsmoos.com.
 */

import { AWTSMOOS_MADE_TEXTURE_RULES } from './AwtsmoosDriveTextureSemanticRulesMade.js';
import { AWTSMOOS_NATURAL_TEXTURE_RULES } from './AwtsmoosDriveTextureSemanticRulesNatural.js';
import { awtsmoosDriveTextureTraits } from './AwtsmoosDriveTextureSemanticTraits.js';

const RULES = Object.freeze([
	...AWTSMOOS_NATURAL_TEXTURE_RULES,
	...AWTSMOOS_MADE_TEXTURE_RULES
]);
const STOPWORDS = new Set([
	'and', 'with', 'without', 'the', 'pure', 'plain', 'natural', 'generic', 'realistic',
	'subtle', 'fine', 'dense', 'surface', 'material', 'texture', 'extremely', 'visible',
	'microscopic', 'microstructure', 'clean', 'uniform', 'structure', 'variation', 'full',
	'half', 'quarter', 'resolution', 'source', 'awtsmoos', 'nature', 'chai', 'forest',
	'png', 'jpg', 'jpeg', 'webp'
]);

/** Returns overlapping semantic metadata instead of forcing one exclusive folder. */
export function classifyAwtsmoosDriveTextureSemantics(record = {}) {
	const text = semanticText(record);
	const matches = RULES.filter(entry => entry.keywords.some(keyword => text.includes(keyword)));
	const categories = unique(matches.flatMap(entry => entry.categories));
	const subcategories = unique(matches.flatMap(entry => entry.subcategories));
	const traits = awtsmoosDriveTextureTraits(text);
	const labels = unique([
		...(record.tags || []),
		...matches.flatMap(entry => entry.labels),
		...meaningfulTokens(text),
		...traits
	]);
	const primary = primaryAddress(categories, subcategories);
	return Object.freeze({
		categories: Object.freeze(categories),
		category: primary.category,
		facets: Object.freeze({
			categories: Object.freeze(categories),
			labels: Object.freeze(labels),
			subcategories: Object.freeze(subcategories),
			traits
		}),
		labels: Object.freeze(labels),
		subcategories: Object.freeze(subcategories),
		subcategory: primary.subcategory
	});
}

/** Builds stable free-text evidence used by both human search and agent ranking. */
export function awtsmoosDriveTextureSemanticText(record = {}) {
	const semantics = classifyAwtsmoosDriveTextureSemantics(record);
	return unique([
		record.name,
		record.path,
		...(record.tags || []),
		...semantics.categories,
		...semantics.subcategories,
		...semantics.labels
	]).join(' ').toLowerCase();
}

function primaryAddress(categories, subcategories) {
	return {
		category: categories[0] || 'other',
		subcategory: subcategories[0] || 'uncategorized'
	};
}

function semanticText(record) {
	return [record.name, record.path, record.sourceDescription, ...(record.tags || [])]
		.filter(Boolean)
		.join(' ')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function meaningfulTokens(text) {
	return text.split(' ')
		.filter(token => token.length > 2 && token.length < 28 && !STOPWORDS.has(token))
		.slice(0, 40);
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}
