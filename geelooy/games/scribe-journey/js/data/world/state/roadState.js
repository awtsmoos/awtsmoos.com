// B"H
// js/data/world/state/roadState.js

/**
 * Chapter 6: A road is a nerve between cities. It does not open because feet
 * reach coordinates; it opens when a teaching was fought for, won, and remembered
 * as a flag in the world-soul.
 */
export class RoadState {
    /**
     * @param {string} id Road id.
     * @param {object} road Authored road graph entry.
     * @param {Set<string>} flags Global victory flags.
     */
    constructor(id, road, flags = new Set()) {
        this.id = id;
        this.from = road.from;
        this.to = road.to;
        this.requiredDebate = road.requiredDebate;
        this.danger = road.danger;
        this.theme = road.theme;
        this.loadMode = road.loadMode;
        this.unlocked = flags.has(`won_${road.requiredDebate}`);
    }

    /** @returns {object} JSON-safe road snapshot. */
    toJSON() {
        return { ...this };
    }
}

/**
 * @param {Record<string, object>} roadGraph Authored road graph.
 * @param {string[]} [flags] Global flags.
 * @returns {Record<string, RoadState>} Road states keyed by road id.
 */
export function createRoadStates(roadGraph, flags = []) {
    const flagSet = new Set(flags);
    return Object.fromEntries(Object.entries(roadGraph).map(([id, road]) => [id, new RoadState(id, road, flagSet)]));
}
