// B"H
// tests/insight/rabbiRoadReport.mjs

import { maps } from '../../js/data/maps.js';
import { MAJOR_CITIES } from '../../js/data/world/majorCities.js';
import { ROAD_GRAPH } from '../../js/data/world/roadGraph.js';

/**
 * Chapter 4: A Rabbi without a road is a lesson without a mission. A road without
 * a Rabbi is travel without inner permission. This report binds city, house,
 * master, debate, and dangerous path into one inspectable covenant.
 */
function buildRabbiRoadReport() {
    const cityIds = new Set(MAJOR_CITIES.map(city => city.id));
    const missing = [];

    for (const city of MAJOR_CITIES) {
        if (!maps[city.id]) missing.push({ type: 'city-map', id: city.id });
        if (!maps[city.chabadHouse]) missing.push({ type: 'chabad-house-map', id: city.chabadHouse, city: city.id });
        if (city.nextCity && !cityIds.has(city.nextCity)) missing.push({ type: 'next-city', city: city.id, nextCity: city.nextCity });
        if (!city.masterRabbi?.id || !city.masterRabbi?.debateId || !city.masterRabbi?.unlocksRoad) {
            missing.push({ type: 'master-rabbi-fields', city: city.id });
            continue;
        }
        const road = ROAD_GRAPH[city.masterRabbi.unlocksRoad];
        if (!road) missing.push({ type: 'road-unlock', city: city.id, roadId: city.masterRabbi.unlocksRoad });
        if (road && (!cityIds.has(road.from) || !cityIds.has(road.to))) {
            missing.push({ type: 'road-endpoint', roadId: city.masterRabbi.unlocksRoad, from: road.from, to: road.to });
        }
        if (road && road.requiredDebate !== city.masterRabbi.debateId) {
            missing.push({ type: 'debate-mismatch', city: city.id, roadId: city.masterRabbi.unlocksRoad });
        }
    }

    return { cityCount: MAJOR_CITIES.length, roadCount: Object.keys(ROAD_GRAPH).length, missing };
}

console.log(JSON.stringify(buildRabbiRoadReport(), null, 2));
