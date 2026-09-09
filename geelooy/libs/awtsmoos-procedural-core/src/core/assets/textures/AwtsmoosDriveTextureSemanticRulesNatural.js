// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemanticRulesNatural.js
 * @description Declares overlapping semantic evidence for natural, geological, botanical, and biological materials.
 * The Awtsmoos is beyond every finite substance; Awtsmoos.com lets one stone truthfully belong to geology, terrain, mineral study, and construction at once.
 */

export const AWTSMOOS_NATURAL_TEXTURE_RULES = Object.freeze([
	rule(['obsidian'], ['geology', 'mineral', 'terrain'], ['volcanic-rock', 'glass'], ['obsidian', 'volcanic-glass', 'igneous']),
	rule(['pumice', 'scoria', 'basalt'], ['geology', 'mineral', 'terrain'], ['volcanic-rock'], ['volcanic', 'igneous', 'rock', 'stone']),
	rule(['granite', 'gneiss', 'schist', 'quartzite', 'slate', 'shale'], ['geology', 'mineral', 'terrain', 'construction'], ['rock', 'stone'], ['rock', 'stone', 'mineral']),
	rule(['limestone', 'sandstone', 'travertine', 'chalk', 'flint', 'chert'], ['geology', 'mineral', 'terrain', 'construction'], ['sedimentary-rock', 'stone'], ['rock', 'stone', 'mineral']),
	rule(['rock', 'stone', 'bedrock', 'boulder'], ['terrain', 'geology', 'mineral', 'construction'], ['rock', 'stone'], ['rock', 'stone', 'mineral']),
	rule(['quartz', 'gypsum', 'alabaster', 'halite', 'salt', 'sulfur', 'mica', 'talc'], ['geology', 'mineral'], ['crystal', 'mineral'], ['mineral', 'crystalline', 'natural']),
	rule(['pebble', 'gravel', 'scree', 'talus'], ['terrain', 'geology'], ['aggregate', 'loose-rock'], ['stone', 'granular', 'ground']),
	rule(['clay', 'soil', 'earth', 'dirt', 'silt', 'mud', 'humus', 'compost'], ['terrain', 'geology'], ['soil'], ['earth', 'ground', 'natural']),
	rule(['sand', 'dust', 'ash'], ['terrain', 'particulate'], ['fine-particles'], ['granular', 'powder', 'particulate']),
	rule(['snow', 'ice'], ['terrain', 'water', 'cryosphere'], ['frozen-water'], ['frozen', 'cold', 'natural']),
	rule(['water', 'river', 'lake', 'pond'], ['water', 'terrain'], ['water-surface'], ['liquid', 'water', 'natural']),
	rule(['oil'], ['liquid', 'industrial'], ['oil'], ['viscous', 'liquid', 'lubricant']),
	rule(['moss', 'algae', 'fern', 'foliage', 'leaf', 'leaves', 'grass'], ['vegetation', 'biology'], ['foliage'], ['plant', 'organic', 'living']),
	rule(['flower', 'petal', 'blossom'], ['vegetation', 'biology'], ['flower'], ['plant', 'organic', 'living']),
	rule(['bark', 'cork'], ['vegetation', 'biology', 'wood'], ['bark'], ['plant', 'organic', 'fibrous']),
	rule(['wood', 'timber', 'plywood'], ['wood', 'construction', 'craft'], ['wood-surface'], ['plant-derived', 'fibrous', 'solid']),
	rule(['bone'], ['biology', 'creatures'], ['bone'], ['animal-derived', 'mineralized', 'organic']),
	rule(['horn', 'antler', 'chitin', 'scale', 'feather', 'fur', 'hide', 'skin'], ['biology', 'creatures'], ['animal-surface'], ['animal-derived', 'organic']),
	rule(['shell', 'nacre', 'pearl', 'coral'], ['biology', 'mineral'], ['biomineral'], ['biological', 'mineralized', 'natural']),
	rule(['beeswax', 'wax'], ['organic', 'craft'], ['wax'], ['wax', 'solid', 'organic']),
	rule(['resin', 'amber'], ['organic', 'geology', 'craft'], ['resin'], ['resinous', 'organic', 'natural']),
	rule(['coal', 'charcoal', 'graphite', 'soot', 'carbon black'], ['carbon', 'geology', 'industrial'], ['carbon-material'], ['carbon-rich', 'dark']),
	rule(['sponge'], ['biology', 'organic'], ['sponge'], ['porous', 'natural', 'biological'])
]);

/** Builds one immutable semantic rule from simple filename evidence. */
function rule(keywords, categories, subcategories, labels) {
	return Object.freeze({
		categories: Object.freeze(categories),
		keywords: Object.freeze(keywords),
		labels: Object.freeze(labels),
		subcategories: Object.freeze(subcategories)
	});
}
