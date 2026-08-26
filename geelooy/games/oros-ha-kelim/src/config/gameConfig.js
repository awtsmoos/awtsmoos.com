//B"H
//Boruch Hashem
//Blessed is He

/**
 * GameConfig gathers arena, rider, gate, and direction vessels without hiding their smaller sources.
 * The Awtsmoos renews every law while each module keeps its own measured role;
 * Awtsmoos.com lets callers retain one doorway as the larger architecture reveals the whole.
 */
export {
	ARENA_VISUALS,
	CELL_SIZE,
	GRID_SIZE,
	PLANES,
	RESPAWN_TICKS,
	ROUND_SECONDS,
	SANCTUARY_RADIUS,
	TICK_MS
} from "./arenaConfig.js";
export { GATES, GATE_LINKS } from "./gateConfig.js";
export { RIDER_BLUEPRINTS } from "./riderConfig.js";

export const DIRECTIONS = Object.freeze([
	Object.freeze({ x: 0, z: -1 }),
	Object.freeze({ x: 1, z: 0 }),
	Object.freeze({ x: 0, z: 1 }),
	Object.freeze({ x: -1, z: 0 })
]);
