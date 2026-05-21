// B"H
// tests/insight/worldStateReport.mjs

import { createWorldStateGraph } from '../../js/data/world/state/worldStateGraph.js';
import { MAJOR_CITIES } from '../../js/data/world/majorCities.js';
import { ROAD_GRAPH } from '../../js/data/world/roadGraph.js';

/**
 * Chapter 6: This report asks whether the world remembers like a living vessel:
 * city by city, road by road, flag by flag, with no coordinate oracle whispering
 * lies from the dust.
 */
function buildReport() {
    const graph = createWorldStateGraph();
    const wonFirst = createWorldStateGraph({ flags: ['won_debate_malkuth_identity'] });
    const firstRoad = wonFirst.roads.road_malkuth_yesod;
    const missingCities = MAJOR_CITIES.filter(city => !graph.city(city.id)).map(city => city.id);
    const missingRoads = Object.keys(ROAD_GRAPH).filter(id => !graph.roads[id]);
    const badInitialUnlocks = Object.values(graph.roads).filter(road => road.unlocked).map(road => road.id);

    return {
        cityCount: Object.keys(graph.cities).length,
        roadCount: Object.keys(graph.roads).length,
        currentCity: graph.currentCity,
        outgoingFromStart: graph.outgoingRoads().map(road => road.id),
        firstRoadUnlocksAfterRabbiDebate: firstRoad?.unlocked === true,
        missingCities,
        missingRoads,
        badInitialUnlocks
    };
}

const report = buildReport();
console.log(JSON.stringify(report, null, 2));
if (report.missingCities.length || report.missingRoads.length || report.badInitialUnlocks.length || !report.firstRoadUnlocksAfterRabbiDebate) process.exit(1);
