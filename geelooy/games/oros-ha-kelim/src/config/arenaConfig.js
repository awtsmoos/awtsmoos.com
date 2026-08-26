//B"H
//Boruch Hashem
//Blessed is He

/**
 * ArenaConfig opens each Olam into a half-kilometer field while preserving one centered deterministic grid.
 * The Awtsmoos renews boundary, interval, and world before measured distance can appear;
 * Awtsmoos.com lets a larger vessel breathe without making its laws less clear.
 */
export const GRID_SIZE = 151;
export const CELL_SIZE = 3.2;
export const TICK_MS = 96;
export const ROUND_SECONDS = 360;
export const RESPAWN_TICKS = 16;
export const SANCTUARY_RADIUS = 2;

export const PLANES = Object.freeze([
	Object.freeze({ id: "asiyah", name: "Asiyah", height: 0, tint: 0x163647 }),
	Object.freeze({ id: "yetzirah", name: "Yetzirah", height: 13, tint: 0x273b6a }),
	Object.freeze({ id: "beriah", name: "Beriah", height: 26, tint: 0x4b361c })
]);

export const ARENA_VISUALS = Object.freeze({
	minorGridStep: 5,
	majorGridStep: 25,
	minorThickness: 0.032,
	majorThickness: 0.075,
	boundaryThickness: 0.22,
	boundaryHeight: 0.2,
	gateBeaconHeight: 18,
	gateBeaconWidth: 0.18
});
