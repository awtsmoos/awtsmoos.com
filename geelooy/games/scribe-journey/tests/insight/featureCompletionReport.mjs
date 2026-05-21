// B"H
// tests/insight/featureCompletionReport.mjs

import { maps } from '../../js/data/maps.js';
import { items } from '../../js/data/items.js';
import { MAJOR_CITIES, MASTER_RABBI_DEBATES } from '../../js/data/world/majorCities.js';
import { ROAD_GRAPH, WORLD_MAP } from '../../js/data/world/roadGraph.js';
import { DEBATE_EFFECTS } from '../../js/workers/combat/debateEffects.js';

function collectMapActions() {
  const found = { giveItem: new Set(), pickup: new Set(), barrels: [], letters: [], startBattle: 0 };
  const walk = value => {
    if (!value) return;
    if (Array.isArray(value)) return value.forEach(walk);
    if (typeof value === 'object') {
      if (value.giveItem) found.giveItem.add(value.giveItem);
      if (value.pickup) found.pickup.add(value.pickup);
      if (value.startBattle) found.startBattle += 1;
      Object.values(value).forEach(walk);
    }
  };
  for (const [mapId, map] of Object.entries(maps)) {
    for (const entity of Object.values(map.interactables || {})) {
      if ((entity.id || '').includes('barrel') || (entity.visual || entity.emoji) === '🛢️') found.barrels.push({ mapId, id: entity.id });
      if ((entity.id || '').includes('letter') || /letter_/.test(JSON.stringify(entity.dialogue || {}))) found.letters.push({ mapId, id: entity.id });
      if (entity.pickup) found.pickup.add(entity.pickup);
      walk(entity.dialogue);
    }
  }
  return found;
}

function buildReport() {
  const mapIds = new Set(Object.keys(maps));
  const cityIds = new Set(MAJOR_CITIES.map(city => city.id));
  const roadEntries = Object.entries(ROAD_GRAPH);
  const actions = collectMapActions();

  const missingCities = MAJOR_CITIES.filter(city => !mapIds.has(city.id)).map(city => city.id);
  const citiesWithoutHouses = MAJOR_CITIES.filter(city => !Array.isArray(city.houses) || city.houses.length < 3).map(city => city.id);
  const missingChabad = MAJOR_CITIES.filter(city => !mapIds.has(city.chabadHouse)).map(city => ({ city: city.id, chabadHouse: city.chabadHouse }));
  const missingMasterDebates = MAJOR_CITIES.filter(city => !MASTER_RABBI_DEBATES[city.masterRabbi?.debateId]).map(city => city.id);
  const weakMasterRabbis = MAJOR_CITIES.filter(city => !city.masterRabbi?.id || !Number.isFinite(city.masterRabbi.level) || city.masterRabbi.level < 1).map(city => city.id);
  const brokenRoads = roadEntries.filter(([roadId, road]) => !cityIds.has(road.from) || !cityIds.has(road.to) || !road.requiredDebate || !road.danger || road.loadMode !== 'dynamic_on_walk').map(([roadId]) => roadId);
  const missingRoadDebateLinks = MAJOR_CITIES.filter(city => {
    const road = ROAD_GRAPH[city.masterRabbi?.unlocksRoad];
    return !road || road.requiredDebate !== city.masterRabbi.debateId;
  }).map(city => city.id);
  const invalidWorldMap = !WORLD_MAP || WORLD_MAP.cityOrder?.length !== MAJOR_CITIES.length || WORLD_MAP.roads?.length !== roadEntries.length || WORLD_MAP.startCity !== MAJOR_CITIES[0].id;

  const requiredItems = ['letter_aleph', 'letter_mem', 'letter_shin', 'manna_dew', 'jug_of_pure_oil'];
  const missingItems = requiredItems.filter(id => !items[id]);
  const hasLetters = actions.letters.length >= 3 && ['letter_aleph', 'letter_mem', 'letter_shin'].every(id => actions.giveItem.has(id));
  const hasBarrel = actions.barrels.length >= 1;
  const hasCollectibles = actions.giveItem.size >= 12 || actions.pickup.size >= 1;
  const debateEffectCount = Object.keys(DEBATE_EFFECTS || {}).length;

  const failures = {
    missingCities,
    citiesWithoutHouses,
    missingChabad,
    missingMasterDebates,
    weakMasterRabbis,
    brokenRoads,
    missingRoadDebateLinks,
    invalidWorldMap: invalidWorldMap ? ['WORLD_MAP incomplete'] : [],
    missingItems,
    missingLetters: hasLetters ? [] : ['letter collection incomplete'],
    missingBarrel: hasBarrel ? [] : ['barrel interaction missing'],
    weakCollectibles: hasCollectibles ? [] : ['not enough collect/giveItem interactions'],
    weakDebateEffects: debateEffectCount >= 6 ? [] : [`only ${debateEffectCount} debate effects`]
  };

  return {
    cityCount: MAJOR_CITIES.length,
    roadCount: roadEntries.length,
    worldMapCities: WORLD_MAP.cityOrder?.length || 0,
    worldMapRoads: WORLD_MAP.roads?.length || 0,
    masterDebateCount: Object.keys(MASTER_RABBI_DEBATES).length,
    debateEffectCount,
    letterInteractables: actions.letters.length,
    barrelInteractables: actions.barrels.length,
    giveItemActionCount: actions.giveItem.size,
    pickupActionCount: actions.pickup.size,
    failures
  };
}

const report = buildReport();
console.log(JSON.stringify(report, null, 2));
if (Object.values(report.failures).some(list => list.length)) process.exit(1);
