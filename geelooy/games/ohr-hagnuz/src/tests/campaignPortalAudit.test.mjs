/**
 * B"H
 * @file campaignPortalAudit.test.mjs
 * @description Every campaign road must be reversible and every spawn must resolve safely.
 */
import assert from 'node:assert/strict';

const { WorldData, isPassableGlyph } = await import('../data/WorldData.js');
const { CampaignPortals } = await import('../data/maps/CampaignPortals.js');
const { safeSpawn, tileAt } = await import('../yesod/world/WorldPathfinding.js');

for (const [source, portals] of Object.entries(CampaignPortals)) {
	assert.ok(WorldData[source], `missing source map ${source}`);
	for (const portal of portals) {
		assert.ok(WorldData[portal.to], `${source}: missing target map ${portal.to}`);
		const spawn = safeSpawn(portal.to, portal.spawn);
		assert.equal(isPassableGlyph(tileAt(spawn.x, spawn.y, portal.to)), true, `${source}->${portal.to}: unsafe spawn`);
		if (portal.to === 'Overworld_Main' || source === 'Overworld_Main') continue;
		const reverse = (CampaignPortals[portal.to] || []).find(candidate => candidate.to === source);
		assert.ok(reverse, `${source}->${portal.to}: missing reverse road`);
	}
}

console.log(JSON.stringify({ maps: Object.keys(CampaignPortals).length, roads: Object.values(CampaignPortals).flat().length }));
