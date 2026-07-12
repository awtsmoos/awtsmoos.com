/**
 * B"H
 * @file campaignDefinitionAudit.test.mjs
 * @description Every authored objective must resolve to real world or system content.
 */
import assert from 'node:assert/strict';

const { CampaignMissionList } = await import('../content/CampaignMissions.js');
const { campaignSceneById } = await import('../content/CampaignScenes.js');
const { StarterMusagim } = await import('../content/prologue/StarterMusagim.js');
const { WorldData, tileMeta } = await import('../data/WorldData.js');
const { ResourceNodeIndex } = await import('../data/gathering/ResourceNodeIndex.js');
const { RecipeIndex } = await import('../data/crafting/RecipeIndex.js');
const { ShopIndex } = await import('../data/economy/ShopIndex.js');
const { encounterById } = await import('../data/EncounterIndex.js');

const metasForMap = mapId => (WorldData[mapId] || [])
	.flatMap(row => [...row].map(glyph => ({ glyph, meta: tileMeta(glyph) })));
const allMetas = Object.keys(WorldData).flatMap(metasForMap);
const hasMeta = (predicate, mapId = null) => (mapId ? metasForMap(mapId) : allMetas).some(entry => predicate(entry));
const shopHas = id => Object.values(ShopIndex).some(shop => shop.items.some(item => item.id === id));
const narrativeDeliveries = new Set(['jerusalem_caravan', 'stolen_niggun', 'rescued_students']);

const verifyObjective = (mission, objective) => {
	const context = `${mission.id}/${objective.id}`;
	switch (objective.type) {
		case 'TRAVEL':
			assert.ok(WorldData[objective.target], `${context}: missing map ${objective.target}`);
			break;
		case 'TALK':
			assert.ok(hasMeta(entry => entry.glyph === objective.target), `${context}: missing NPC glyph ${objective.target}`);
			break;
		case 'INSPECT':
			assert.ok(hasMeta(entry => [entry.meta.book, entry.meta.questItem, entry.meta.gift].includes(objective.target), objective.mapId), `${context}: missing inspect target ${objective.target}`);
			break;
		case 'BATTLE':
			assert.ok(encounterById(objective.target), `${context}: missing encounter ${objective.target}`);
			break;
		case 'GATHER':
			assert.ok(ResourceNodeIndex[objective.target], `${context}: missing resource ${objective.target}`);
			break;
		case 'CRAFT':
			assert.ok(RecipeIndex[objective.target], `${context}: missing recipe ${objective.target}`);
			break;
		case 'SHOP_BUY':
		case 'SHOP_SELL':
			assert.ok(shopHas(objective.target), `${context}: missing shop item ${objective.target}`);
			break;
		case 'CHOICE':
			assert.ok(campaignSceneById(objective.sceneId), `${context}: missing choice scene ${objective.sceneId}`);
			break;
		case 'STARTER':
			assert.ok(Object.keys(StarterMusagim).length >= 3, `${context}: starter catalog incomplete`);
			break;
		case 'DELIVER':
			assert.ok(narrativeDeliveries.has(objective.target) || hasMeta(entry => entry.meta.gift === objective.target), `${context}: missing deliverable ${objective.target}`);
			break;
		case 'HEAL':
			assert.ok(hasMeta(entry => entry.meta.kind === 'synagogue'), `${context}: missing synagogue`);
			break;
		case 'MITZVAH':
			assert.ok(hasMeta(entry => entry.meta.kind === 'mitzvah'), `${context}: missing mitzvah tile`);
			break;
		case 'PUZZLE':
			assert.ok(WorldData[objective.mapId || mission.mapId], `${context}: missing puzzle map`);
			break;
		case 'DECLARE':
			assert.equal(objective.target, 'declaration_clause');
			break;
		default:
			throw new Error(`${context}: unsupported objective type ${objective.type}`);
	}
};

for (const mission of CampaignMissionList) {
	assert.ok(campaignSceneById(mission.introScene), `${mission.id}: missing intro scene`);
	assert.ok(campaignSceneById(mission.completionScene), `${mission.id}: missing completion scene`);
	mission.objectives.forEach(objective => verifyObjective(mission, objective));
}

console.log(JSON.stringify({ missions: CampaignMissionList.length, objectives: CampaignMissionList.flatMap(mission => mission.objectives).length }));
