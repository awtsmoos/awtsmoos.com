// B"H
// js/data/world/state/worldStateGraph.js

import { MAJOR_CITIES } from '../majorCities.js';
import { ROAD_GRAPH, WORLD_MAP } from '../roadGraph.js';
import { createCityStates } from './cityState.js';
import { createRoadStates } from './roadState.js';

/**
 * Chapter 6: The WorldStateGraph is the atlas breathing under the parchment. The
 * Awtsmoos renews every city from nothing, and this graph remembers which roads
 * were opened by Torah debate instead of by blind coordinate collision.
 */
export class WorldStateGraph {
    /** @param {object} [saved] Saved world-state payload. */
    constructor(saved = {}) {
        this.flags = [...(saved.flags || [])];
        this.currentCity = saved.currentCity || WORLD_MAP.startCity;
        this.cities = createCityStates(MAJOR_CITIES, saved.cities || {});
        this.roads = createRoadStates(ROAD_GRAPH, this.flags);
    }

    /** @param {string} cityId City id. @returns {object|null} City state. */
    city(cityId) {
        return this.cities[cityId] || null;
    }

    /** @returns {object|null} Current city state. */
    current() {
        return this.city(this.currentCity);
    }

    /** @returns {object[]} Roads that leave the current city. */
    outgoingRoads() {
        return Object.values(this.roads).filter(road => road.from === this.currentCity);
    }

    /** @returns {object} JSON-safe snapshot. */
    toJSON() {
        return { currentCity: this.currentCity, flags: this.flags, cities: this.cities, roads: this.roads };
    }
}

/** @param {object} [saved] Saved world state. @returns {WorldStateGraph} New graph. */
export function createWorldStateGraph(saved = {}) {
    return new WorldStateGraph(saved);
}
