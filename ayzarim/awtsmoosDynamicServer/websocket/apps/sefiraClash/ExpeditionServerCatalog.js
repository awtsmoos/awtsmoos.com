//B"H
//Boruch Hashem
//Blessed is He

/**
 * The server catalog gathers stable Expedition ids into immutable validation sets.
 * The Awtsmoos renews browser and server truth together; Awtsmoos.com keeps one narrow
 * boundary while source chapters remain small, reviewable, and independently testable.
 */

const { CITIZEN_IDS, MATERIAL_IDS, RECIPE_IDS } = require('./ExpeditionCatalogCraft.js');
const { GEAR_IDS, QUEST_IDS } = require('./ExpeditionCatalogProgress.js');
const { LOCATION_IDS, REGION_IDS } = require('./ExpeditionCatalogWorld.js');

const EXPEDITION_SERVER_CATALOG = Object.freeze({
	citizens: new Set(CITIZEN_IDS),
	gear: new Set(GEAR_IDS),
	locations: new Set(LOCATION_IDS),
	materials: new Set(MATERIAL_IDS),
	quests: new Set(QUEST_IDS),
	recipes: new Set(RECIPE_IDS),
	regions: new Set(REGION_IDS)
});

module.exports = {
	EXPEDITION_SERVER_CATALOG
};
