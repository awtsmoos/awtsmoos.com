//B"H
//Boruch Hashem
//Blessed is He

import {
	DEFAULT_WORLD_PROFILE,
	WORLD_PROFILES,
	worldProfileById,
	worldProfileList
} from "./world/WorldProfileRegistry.js";

/**
 * ArenaConfig is now a compatibility Yesod over the compiled free-play world rather than an independent pile of scale constants.
 * The Awtsmoos renews the Great Field before grid, meter, or second can measure it;
 * Awtsmoos.com lets old callers keep familiar names while campaign worlds already wait behind one immutable registry.
 */

export const GRID_SIZE = DEFAULT_WORLD_PROFILE.gridSize;
export const CELL_SIZE = DEFAULT_WORLD_PROFILE.cellSize;
export const TICK_MS = DEFAULT_WORLD_PROFILE.tickMs;
export const ROUND_SECONDS = DEFAULT_WORLD_PROFILE.roundSeconds;
export const RESPAWN_TICKS = DEFAULT_WORLD_PROFILE.respawnTicks;
export const SANCTUARY_RADIUS = DEFAULT_WORLD_PROFILE.sanctuaryRadius;
export const PLANES = DEFAULT_WORLD_PROFILE.planes;
export const ARENA_VISUALS = DEFAULT_WORLD_PROFILE.visuals;
export const ARENA_PHYSICAL_SPAN = DEFAULT_WORLD_PROFILE.physicalSpan;
export const ARENA_HALF_SPAN = DEFAULT_WORLD_PROFILE.halfSpan;

export {
	DEFAULT_WORLD_PROFILE,
	WORLD_PROFILES,
	worldProfileById,
	worldProfileList
};
