// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureCategories.js
 * @description Gives every remote surface an AI-readable category and subcategory using stable semantic vocabulary.
 * The Awtsmoos is beyond every category while stone, bark, river, cloth, and soil each reveal a useful finite address inside Awtsmoos.com.
 */

const RULES = Object.freeze([
	rule('vegetation', 'bark', 'Tree bark and trunk surfaces', ['bark']),
	rule('vegetation', 'foliage', 'Leaves, needles, fronds, sprays, and canopy', ['leaf', 'foliage', 'canopy', 'needle', 'frond', 'cedar spray']),
	rule('vegetation', 'flowers', 'Flowers, petals, gardens, and flowering ground', ['flower', 'petal', 'rose', 'hydrangea']),
	rule('creatures', 'fur', 'Animal fur and hide references', ['cow fur', 'deer fur', 'fox fur', 'horse fur']),
	rule('water', 'shoreline', 'Wet banks, marsh edges, riverbeds, and saturated shore ground', ['riverbank', 'riverbed', 'stream bed', 'stream-bed', 'lake edge', 'marsh ground', 'water-saturated']),
	rule('water', 'surface', 'Water surfaces, river flow, pools, and reflective water', ['seamless water', 'shallow river water', 'water not seamless', 'water surface']),
	rule('architecture', 'roofing', 'Roof tiles, slate, shingles, and ceramic coverings', ['roof', 'shingle', 'tile']),
	rule('architecture', 'plaster', 'Plaster, stucco, whitewash, and wall finish', ['plaster', 'stucco', 'whitewash']),
	rule('architecture', 'masonry', 'Walls, bricks, cobbles, paving, stairs, foundations, and cut stone', ['brick', 'masonry', 'cobble', 'paving', 'flagstone', 'retaining wall', 'foundation', 'limestone block', 'stone floor', 'cottage wall']),
	rule('architecture', 'timber', 'Structural wood, boards, planks, decking, and aged timber', ['wood', 'timber', 'plank', 'decking', 'board']),
	rule('architecture', 'metal', 'Copper, iron, silver, gold, and architectural metal', ['copper', 'iron', 'silver', 'gold ', 'metal']),
	rule('architecture', 'glass', 'Glass and transparent architectural surfaces', ['glass']),
	rule('terrain', 'snow', 'Snow, snowmelt, and high-altitude frozen ground', ['snow']),
	rule('terrain', 'grassland', 'Grass, meadow, turf, and grassy transitions', ['grass', 'meadow', 'turf']),
	rule('terrain', 'soil', 'Dirt, earth, clay, humus, compost, mud, and cultivated soil', ['dirt', 'soil', 'earth', 'clay', 'humus', 'compost', 'mud']),
	rule('terrain', 'gravel', 'Gravel, scree, pebbles, talus, aggregate, and moraine', ['gravel', 'scree', 'pebble', 'talus', 'aggregate', 'moraine']),
	rule('terrain', 'rock', 'Cliff, bedrock, boulder, granite, slate, limestone, and exposed rock', ['rock', 'bedrock', 'cliff', 'boulder', 'granite', 'slate', 'limestone', 'stone']),
	rule('craft', 'fabric', 'Cloth, fabric, and textile surfaces', ['cloth', 'fabric']),
	rule('craft', 'rope', 'Rope and cordage', ['rope']),
	rule('craft', 'paper', 'Parchment and paper-like surfaces', ['parchment']),
	rule('craft', 'leather', 'Leather and worked hide', ['leather'])
]);

export const AWTSMOOS_DRIVE_TEXTURE_TAXONOMY = Object.freeze(RULES.map(entry => Object.freeze({
	category: entry.category,
	description: entry.description,
	subcategory: entry.subcategory
})));

/** @param {object} record Texture record. @returns {object} Category classification. */
export function classifyAwtsmoosDriveTexture(record = {}) {
	const text = normalize([record.name, record.path, ...(record.tags || [])].join(' '));
	const match = RULES.find(entry => entry.keywords.some(keyword => text.includes(keyword)));
	return Object.freeze(match
		? { category: match.category, subcategory: match.subcategory }
		: { category: 'other', subcategory: 'uncategorized' });
}

/** @returns {object} Compact AI-facing category tree. */
export function awtsmoosDriveTextureCategoryTree() {
	const tree = {};
	for (const entry of RULES) (tree[entry.category] ||= {})[entry.subcategory] = entry.description;
	return Object.freeze(Object.fromEntries(Object.entries(tree).map(([category, children]) => [category, Object.freeze(children)])));
}

function rule(category, subcategory, description, keywords) {
	return Object.freeze({ category, description, keywords: Object.freeze(keywords.map(normalize)), subcategory });
}
function normalize(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(); }
