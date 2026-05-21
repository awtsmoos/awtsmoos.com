// B"H
// js/data/world/navigation/directionHelper.js

import { MAJOR_CITIES } from '../majorCities.js';
import { ROAD_GRAPH } from '../roadGraph.js';
import { createRoadUnlockService } from './roadUnlockService.js';

const cityById = Object.fromEntries(MAJOR_CITIES.map(city => [city.id, city]));

/**
 * Chapter 7: The world must not leave the player wandering in static fog. This
 * helper turns the road graph into a living instruction: city, Rabbi, road,
 * danger, level, and the next holy movement.
 */
export class DirectionHelper {
    /** @param {string[]} [flags] Global flags. */
    constructor(flags = []) {
        this.unlocks = createRoadUnlockService(flags);
    }

    /**
     * @param {string} cityId Current city id.
     * @returns {object} Direction payload for UI, dialogue, and quest hints.
     */
    nextStep(cityId) {
        const city = cityById[cityId];
        if (!city) return { ok: false, reason: 'unknown_city', cityId };
        const roadId = city.masterRabbi?.unlocksRoad;
        const road = ROAD_GRAPH[roadId];
        if (!road) return { ok: false, reason: 'missing_next_road', cityId, roadId };
        const gate = this.unlocks.checkRoad(roadId);
        const destination = cityById[road.to];
        return {
            ok: true,
            cityId,
            cityName: city.name,
            nextCityId: road.to,
            nextCityName: destination?.name || road.to,
            roadId,
            danger: road.danger,
            theme: road.theme,
            unlocked: gate.ok,
            rabbiName: city.masterRabbi.name,
            requiredLevel: city.masterRabbi.level,
            requiredDebate: city.masterRabbi.debateId,
            objectiveText: gate.ok
                ? `Travel the ${road.theme} road toward ${destination?.name || road.to}.`
                : gate.instruction
        };
    }
}

/** @param {string[]} [flags] Global flags. @returns {DirectionHelper} Helper. */
export function createDirectionHelper(flags = []) {
    return new DirectionHelper(flags);
}
