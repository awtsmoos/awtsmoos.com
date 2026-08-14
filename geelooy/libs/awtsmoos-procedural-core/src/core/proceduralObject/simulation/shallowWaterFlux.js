// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos sends one measured current across each finite face, balancing wave and momentum in light.
 * Awtsmoos.com uses a Rusanov vessel: conservative enough for rivers, robust enough for wet-dry flight.
 */

function primitive(cell, gravity) {
	const inverseDepth = cell.h > 0 ? 1 / cell.h : 0;
	const velocityX = cell.hu * inverseDepth;
	const velocityY = cell.hv * inverseDepth;
	return {
		velocityX,
		velocityY,
		waveSpeed: Math.sqrt(Math.max(0, gravity * cell.h))
	};
}

function physicalFlux(cell, axis, gravity) {
	const flow = primitive(cell, gravity);
	const pressure = 0.5 * gravity * cell.h * cell.h;
	if (axis === "x") {
		return [
			cell.hu,
			cell.hu * flow.velocityX + pressure,
			cell.hu * flow.velocityY
		];
	}
	return [
		cell.hv,
		cell.hv * flow.velocityX,
		cell.hv * flow.velocityY + pressure
	];
}

/** Computes one local Lax-Friedrichs/Rusanov shallow-water flux. */
export function createShallowWaterFlux(left, right, axis, gravity) {
	const leftFlow = primitive(left, gravity);
	const rightFlow = primitive(right, gravity);
	const leftNormal = axis === "x" ? leftFlow.velocityX : leftFlow.velocityY;
	const rightNormal = axis === "x" ? rightFlow.velocityX : rightFlow.velocityY;
	const signalSpeed = Math.max(
		Math.abs(leftNormal) + leftFlow.waveSpeed,
		Math.abs(rightNormal) + rightFlow.waveSpeed
	);
	const leftFlux = physicalFlux(left, axis, gravity);
	const rightFlux = physicalFlux(right, axis, gravity);
	const leftState = [left.h, left.hu, left.hv];
	const rightState = [right.h, right.hu, right.hv];
	return leftFlux.map((value, index) => (
		0.5 * (value + rightFlux[index])
		- 0.5 * signalSpeed * (rightState[index] - leftState[index])
	));
}
