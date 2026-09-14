// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemanticRulesNatural.js
 * @description Declares overlapping semantic evidence for natural, geological, botanical, and biological materials.
 * Awtsmoos.com gives each independent substance precise scientific and practical labels while broad discovery remains possible.
 */

export const AWTSMOOS_NATURAL_TEXTURE_RULES = Object.freeze([
	rule(['obsidian'], ['geology', 'mineral', 'terrain'], ['volcanic-rock', 'volcanic-glass'], ['obsidian', 'volcanic-glass', 'igneous', 'glassy']),
	rule(['pumice', 'scoria', 'basalt'], ['geology', 'mineral', 'terrain'], ['volcanic-rock', 'igneous-rock'], ['volcanic', 'igneous', 'rock', 'stone']),
	rule(['granite'], ['geology', 'mineral', 'terrain', 'construction'], ['igneous-rock', 'stone'], ['igneous', 'rock', 'stone', 'mineral']),
	rule(['gneiss', 'schist', 'quartzite', 'slate', 'soapstone'], ['geology', 'mineral', 'terrain', 'construction'], ['metamorphic-rock', 'stone'], ['metamorphic', 'rock', 'stone', 'mineral']),
	rule(['shale', 'limestone', 'sandstone', 'travertine', 'chalk', 'flint', 'chert'], ['geology', 'mineral', 'terrain', 'construction'], ['sedimentary-rock', 'stone'], ['sedimentary', 'rock', 'stone', 'mineral']),
	rule(['rock', 'stone', 'bedrock', 'boulder'], ['terrain', 'geology', 'mineral', 'construction'], ['rock', 'stone'], ['rock', 'stone', 'mineral'], ['rock salt', 'rock wool']),
	rule(['quartz', 'gypsum', 'alabaster', 'halite', 'salt', 'sulfur', 'mica', 'talc'], ['geology', 'mineral'], ['crystal', 'mineral'], ['mineral', 'crystalline', 'natural']),
	rule(['pebble', 'gravel', 'scree', 'talus'], ['terrain', 'geology'], ['aggregate', 'loose-rock'], ['stone', 'granular', 'ground']),
	rule(['clay', 'soil', 'earth', 'dirt', 'silt', 'mud', 'humus', 'compost'], ['terrain', 'geology'], ['soil'], ['earth', 'ground', 'natural']),
	rule(['wood ash'], ['particulate', 'plant-derived'], ['combustion-residue'], ['ash', 'powder', 'plant-derived', 'combustion-residue']),
	rule(['sand', 'dust', 'ash'], ['terrain', 'particulate'], ['fine-particles'], ['granular', 'powder', 'particulate'], ['wood ash']),
	rule(['snow', 'ice'], ['terrain', 'water', 'cryosphere'], ['frozen-water'], ['frozen', 'cold', 'natural']),
	rule(['water', 'river', 'lake', 'pond'], ['water', 'terrain'], ['water-surface'], ['liquid', 'water', 'natural']),
	rule(['oil'], ['liquid', 'industrial'], ['oil'], ['viscous', 'liquid', 'lubricant']),
	rule(['moss', 'algae', 'fern', 'foliage', 'leaf', 'leaves', 'grass'], ['vegetation', 'biology'], ['foliage'], ['plant', 'organic', 'living']),
	rule(['flower', 'petal', 'blossom'], ['vegetation', 'biology'], ['flower'], ['plant', 'organic', 'living']),
	rule(['bark', 'cork'], ['vegetation', 'biology', 'wood'], ['bark'], ['plant', 'organic', 'fibrous']),
	rule(['wood', 'timber', 'plywood'], ['wood', 'construction', 'craft'], ['wood-surface'], ['plant-derived', 'fibrous', 'solid'], ['wood ash', 'wood charcoal', 'mineral wool', 'rock wool']),
	rule(['straw', 'hay', 'reed'], ['vegetation', 'biology', 'plant-derived', 'craft'], ['dry-plant-fiber'], ['plant-fiber', 'cellulose', 'dry-fiber', 'natural-fiber']),
	rule(['bone'], ['biology', 'creatures', 'animal-derived'], ['bone'], ['bone', 'animal-derived', 'mineralized', 'organic']),
	rule(['horn'], ['biology', 'creatures', 'animal-derived', 'craft'], ['horn', 'keratin'], ['horn', 'keratin', 'animal-derived', 'organic']),
	rule(['antler'], ['biology', 'creatures', 'animal-derived', 'craft'], ['antler'], ['antler', 'mineralized', 'animal-derived', 'organic']),
	rule(['chitin'], ['biology', 'creatures', 'animal-derived'], ['chitin', 'exoskeleton'], ['chitin', 'exoskeleton', 'animal-derived', 'organic']),
	rule(['scale', 'scales'], ['biology', 'creatures', 'animal-derived'], ['scales'], ['scales', 'keratin', 'animal-derived', 'organic']),
	rule(['feather', 'plumage'], ['biology', 'creatures', 'animal-derived'], ['feather'], ['feather', 'plumage', 'keratin', 'animal-derived']),
	rule(['fur', 'hide', 'skin', 'epidermis'], ['biology', 'creatures', 'animal-derived'], ['animal-skin'], ['skin', 'hide', 'animal-derived', 'organic']),
	rule(['shell', 'nacre', 'pearl'], ['biology', 'mineral', 'animal-derived'], ['biomineral', 'shell'], ['biological', 'mineralized', 'calcium-carbonate', 'natural']),
	rule(['coral'], ['biology', 'mineral'], ['biomineral', 'coral'], ['biological', 'mineralized', 'calcium-carbonate', 'natural']),
	rule(['beeswax'], ['organic', 'craft', 'animal-derived'], ['wax'], ['beeswax', 'wax', 'solid', 'organic']),
	rule(['wax'], ['organic', 'craft'], ['wax'], ['wax', 'solid', 'organic']),
	rule(['resin', 'amber'], ['organic', 'geology', 'craft', 'plant-derived'], ['resin'], ['resinous', 'organic', 'natural', 'plant-derived']),
	rule(['coal', 'graphite'], ['carbon', 'geology', 'industrial'], ['carbon-material'], ['carbon-rich', 'dark', 'geological-carbon']),
	rule(['charcoal', 'soot', 'carbon black'], ['carbon', 'industrial'], ['carbon-material'], ['carbon-rich', 'dark', 'combustion-carbon']),
	rule(['wood charcoal'], ['carbon', 'industrial', 'plant-derived'], ['charcoal'], ['charcoal', 'carbonized-wood', 'plant-derived', 'porous']),
	rule(['bitumen'], ['organic', 'geology', 'carbon', 'industrial'], ['bitumen'], ['hydrocarbon', 'petroleum', 'bituminous', 'solid']),
	rule(['sponge'], ['biology', 'organic'], ['sponge'], ['porous', 'natural', 'biological'])
]);

/** Builds one immutable semantic rule with optional whole-phrase exclusions. */
function rule(keywords, categories, subcategories, labels, excludes = []) {
	return Object.freeze({
		categories: Object.freeze(categories),
		excludes: Object.freeze(excludes),
		keywords: Object.freeze(keywords),
		labels: Object.freeze(labels),
		subcategories: Object.freeze(subcategories)
	});
}
