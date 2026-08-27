//B"H
//Boruch Hashem
//Blessed is He

/**
 * Progress ids mirror public gear and quest covenants for server profile validation.
 * The Awtsmoos renews equipment and promise together; Awtsmoos.com accepts only these
 * stable identifiers and never trusts client-supplied derived power or arbitrary names.
 */

const GEAR_IDS = Object.freeze([
	'training-sword',
	'woven-vest',
	'travel-mantle',
	'path-boots',
	'spark-charm',
	'cedar-edge',
	'moon-staff',
	'foundation-boots',
	'mirror-blade',
	'echo-mantle',
	'causeway-spear',
	'victory-boots',
	'harmony-mail',
	'heart-relic',
	'gevurah-axe',
	'iron-cuirass',
	'mercy-shield',
	'river-mantle',
	'binah-plate',
	'labyrinth-relic',
	'storm-gauntlet',
	'lightning-boots',
	'crown-armor',
	'unbounded-mantle',
	'unity-relic'
]);

const QUEST_IDS = Object.freeze([
	'citadel-oath',
	'forest-light',
	'foundation-rhythm',
	'marsh-hunt',
	'mirror-truth',
	'echo-pilgrimage',
	'port-challenge',
	'endurance-road',
	'balanced-garden',
	'heart-covenant',
	'foundry-law',
	'ironwood-armor',
	'open-hands',
	'river-crossing',
	'forms-understood',
	'tower-thread',
	'storm-answer',
	'lightning-path',
	'crown-road',
	'unity-return'
]);

module.exports = {
	GEAR_IDS,
	QUEST_IDS
};
