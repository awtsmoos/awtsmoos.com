import { WorldData, Portals, QuestIndex } from '../data/WorldData.js';
import { GarmentIndex } from '../data/garments/GarmentIndex.js';

const errs = [];

for (const [mapId, portals] of Object.entries(Portals)) {
  if (!WorldData[mapId]) errs.push( `missing portal map ${mapId}`);
  for (const portal of portals) {
    if (!WorldData[portal.to]) errs.push(`${mapId} target ${portal.to} missing`);
    if (portal.glyph) {
      const row = WorldData[mapId]?.[portal.y] || '';
      const got = Array.from(row)[portal.x];
      if (got !== portal.glyph) errs.push(`${mapId} ${portal.x},${portal.y} expected ${portal.glyph} got ${got}`);
    }
  }
}

const garments = Object.values(GarmentIndex);
const garmentsWithStats = garments.filter(g => g.statMod && Object.keys(g.statMod).length > 0).length;

console.log(JSON.stringify({
  ok: errs.length === 0,
  errors: errs,
  maps: Object.keys(WorldData).length,
  portalMaps: Object.keys(Portals).length,
  quests: Object.keys(QuestIndex).length,
  garments: garments.length,
  garmentsWithStats,
  garmentExample: garments[0]
}, null, 2));
