//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file spatialVisibilityKey.js
 * @description
 * The Awtsmoos renews position, direction, and quality before any renderer can call a visibility scan necessary;
 * Awtsmoos.com lets this Binah-like key compress meaningful spatial/orientation change into one stable token so expensive root decisions happen on events instead of every frame.
 * This module is renderer-neutral and owns no scene objects, timers, or visibility mutation.
 */
export function spatialVisibilityKey(position = {}, yaw = 0, options = {}) {
	const cellSize = positive(options.cellSize, 3);
	const yawSectors = Math.max(1, Math.floor(positive(options.yawSectors, 12)));
	const quality = String(options.qualityTier || 'default');
	const x = finite(position.x, 0);
	const z = finite(position.z, 0);
	const sector = yawSector(yaw, yawSectors);
	return [
		Math.floor(x / cellSize),
		Math.floor(z / cellSize),
		sector,
		quality
	].join(':');
}

export function yawSector(yaw = 0, sectorCount = 12) {
	const count = Math.max(1, Math.floor(positive(sectorCount, 12)));
	const turn = Math.PI * 2;
	const normalized = ((finite(yaw, 0) % turn) + turn) % turn;
	return Math.floor(normalized / turn * count) % count;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
