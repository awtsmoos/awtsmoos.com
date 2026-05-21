// B"H
// js/data/world/navigation/roadUnlockService.js

import { MAJOR_CITIES, MASTER_RABBI_DEBATES } from '../majorCities.js';
import { ROAD_GRAPH } from '../roadGraph.js';

const cityById = Object.fromEntries(MAJOR_CITIES.map(city => [city.id, city]));

/**
 * Chapter 7: Roads do not open because a body bumped into a coordinate. They
 * open because the player faced a master Rabbi, absorbed the teaching, and the
 * world remembers the victory flag.
 */
export class RoadUnlockService {
    /** @param {string[]} [flags] Global world flags. */
    constructor(flags = []) {
        this.flags = new Set(flags);
    }

    /** @param {string} debateId Debate id. @returns {string} Victory flag. */
    victoryFlag(debateId) {
        return `won_${debateId}`;
    }

    /** @param {string} roadId Road id. @returns {boolean} True if road is open. */
    isRoadUnlocked(roadId) {
        const road = ROAD_GRAPH[roadId];
        return Boolean(road && this.flags.has(this.victoryFlag(road.requiredDebate)));
    }

    /**
     * @param {string} roadId Road id.
     * @returns {object} Gate decision with instruction when locked.
     */
    checkRoad(roadId) {
        const road = ROAD_GRAPH[roadId];
        if (!road) return { ok: false, reason: 'missing_road', roadId };
        const debate = MASTER_RABBI_DEBATES[road.requiredDebate];
        const city = cityById[road.from];
        const rabbi = city?.masterRabbi;
        if (this.isRoadUnlocked(roadId)) return { ok: true, roadId, from: road.from, to: road.to };
        return {
            ok: false,
            reason: 'rabbi_debate_required',
            roadId,
            from: road.from,
            to: road.to,
            requiredDebate: road.requiredDebate,
            requiredFlag: this.victoryFlag(road.requiredDebate),
            rabbiId: rabbi?.id,
            rabbiName: rabbi?.name,
            requiredLevel: debate?.requiredLevel ?? rabbi?.level,
            instruction: `Debate ${rabbi?.name || 'the master Rabbi'} in ${city?.name || road.from} to open ${roadId}.`
        };
    }
}

/** @param {string[]} [flags] Global flags. @returns {RoadUnlockService} Service. */
export function createRoadUnlockService(flags = []) {
    return new RoadUnlockService(flags);
}
