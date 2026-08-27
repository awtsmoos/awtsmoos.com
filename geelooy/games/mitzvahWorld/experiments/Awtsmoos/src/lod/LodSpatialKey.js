// B"H

const TAU = Math.PI * 2;

/** Quantizes world position and camera yaw into stable event keys. */
export function lodSpatialKey({
	position,
	yaw = 0,
	cellSize = 12,
	sectorCount = 16
}) {
	return {
		cellX: quantize(position?.x, cellSize),
		cellY: quantize(position?.y, cellSize),
		cellZ: quantize(position?.z, cellSize),
		cameraSector: yawSector(yaw, sectorCount)
	};
}

export function lodSpatialKeyString(key) {
	return [
		key?.cellX ?? 0,
		key?.cellY ?? 0,
		key?.cellZ ?? 0,
		key?.cameraSector ?? 0
	].join(':');
}

export function lodSpatialKeyChanged(previous, next) {
	if (!previous) return true;
	return previous.cellX !== next.cellX
		|| previous.cellY !== next.cellY
		|| previous.cellZ !== next.cellZ
		|| previous.cameraSector !== next.cameraSector;
}

export function yawSector(yaw, sectorCount = 16) {
	const count = Math.max(1, sectorCount | 0);
	const normalized = positiveModulo(yaw, TAU);
	return Math.min(
		count - 1,
		Math.floor(normalized / TAU * count)
	);
}

function quantize(value, cellSize) {
	const safeValue = Number.isFinite(value) ? value : 0;
	const safeCellSize = Number.isFinite(cellSize) && cellSize > 0
		? cellSize
		: 1;
	return Math.floor(safeValue / safeCellSize);
}

function positiveModulo(value, divisor) {
	const safeValue = Number.isFinite(value) ? value : 0;
	return (safeValue % divisor + divisor) % divisor;
}
