// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets finite cells exchange one conserved current without confusing depth with speed.
 * Awtsmoos.com keeps wetness, terrain, walls, and boundaries explicit so every solver step can read one creed.
 */

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function baseCell(state, arrays, index) {
	const blocked = Number(state.obstacles?.values?.[index] ?? 0) >= 0.5;
	const depth = blocked ? 0 : Math.max(0, Number(arrays.height[index] ?? 0));
	const wet = depth > state.minDepth;
	const velocityX = wet ? Number(arrays.velocityX[index] ?? 0) : 0;
	const velocityY = wet ? Number(arrays.velocityY[index] ?? 0) : 0;
	return {
		bed: Number(state.terrain?.values?.[index] ?? 0),
		blocked,
		h: wet ? depth : 0,
		hu: wet ? depth * velocityX : 0,
		hv: wet ? depth * velocityY : 0
	};
}

function reflected(cell, axis) {
	return {
		...cell,
		hu: axis === "x" ? -cell.hu : cell.hu,
		hv: axis === "y" ? -cell.hv : cell.hv
	};
}

/** Reads one conservative cell while honoring open, closed, periodic, and obstacle boundaries. */
export function readShallowWaterCell(state, arrays, x, y, offsetX = 0, offsetY = 0) {
	const targetX = x + offsetX;
	const targetY = y + offsetY;
	const inside = targetX >= 0 && targetX < state.height.width
		&& targetY >= 0 && targetY < state.height.height;
	const centerIndex = y * state.height.width + x;
	const axis = offsetX !== 0 ? "x" : "y";
	if (!inside && state.boundary === "closed") {
		return reflected(baseCell(state, arrays, centerIndex), axis);
	}
	let resolvedX = targetX;
	let resolvedY = targetY;
	if (state.boundary === "periodic") {
		resolvedX = (targetX + state.height.width) % state.height.width;
		resolvedY = (targetY + state.height.height) % state.height.height;
	} else {
		resolvedX = clamp(targetX, 0, state.height.width - 1);
		resolvedY = clamp(targetY, 0, state.height.height - 1);
	}
	const neighborIndex = resolvedY * state.height.width + resolvedX;
	const neighbor = baseCell(state, arrays, neighborIndex);
	return neighbor.blocked ? reflected(baseCell(state, arrays, centerIndex), axis) : neighbor;
}

/** Converts conserved momentum back into a stable velocity pair. */
export function shallowWaterVelocity(cell, minDepth) {
	if (cell.h <= minDepth) return [0, 0];
	return [cell.hu / cell.h, cell.hv / cell.h];
}
