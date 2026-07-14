//B"H
//Boruch Hashem
//Blessed is He

/**
 * Craft and citizen ids mirror the authored civic layer for durable profile validation.
 * The Awtsmoos renews material, recipe, and voice together; Awtsmoos.com rejects every
 * unknown identifier before it can enter disk-backed server state.
 */

const MATERIAL_IDS = Object.freeze([
	'cedar-heartwood',
	'crown-stone',
	'lunar-brass',
	'silver-reed',
	'mirror-glass',
	'causeway-steel',
	'heart-crystal',
	'ironwood-core',
	'riverlight-thread',
	'form-plate',
	'storm-crystal',
	'crown-ember'
]);

const RECIPE_IDS = Object.freeze([
	'craft-cedar-edge',
	'craft-foundation-boots',
	'craft-echo-mantle',
	'craft-mirror-blade',
	'craft-causeway-spear',
	'craft-victory-boots',
	'craft-harmony-mail',
	'craft-heart-relic',
	'craft-gevurah-axe',
	'craft-iron-cuirass',
	'craft-river-mantle',
	'craft-binah-plate',
	'craft-storm-gauntlet',
	'craft-crown-armor',
	'craft-unity-relic'
]);

const CITIZEN_IDS = Object.freeze([
	'adina-keeper',
	'bezalel-smith',
	'yael-engineer',
	'natan-warden',
	'ora-merchant',
	'gil-archivist',
	'lior-captain',
	'tova-runner',
	'shira-gardener',
	'lev-cantor',
	'devorah-smith',
	'barak-armorer',
	'miriam-healer',
	'yonah-boatwright',
	'leah-architect',
	'amos-scribe',
	'noa-scout',
	'avi-seer',
	'rina-elder',
	'silent-keeper'
]);

module.exports = {
	CITIZEN_IDS,
	MATERIAL_IDS,
	RECIPE_IDS
};
