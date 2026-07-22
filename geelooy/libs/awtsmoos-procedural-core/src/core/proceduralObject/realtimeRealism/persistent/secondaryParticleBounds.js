// B"H
// Boruch Hashem
// Blessed is He
/** Domain bounds keep visual particles inside an explicit physical vessel. */

/** Derives an axis-aligned simulation vessel from the liquid grid. */
export function liquidDomainBounds(state, margin = 0) {
	const origin = state.grid.origin ?? [0, 0, 0];
	const shape = state.grid.shape;
	const cellSize = state.grid.cellSize;
	return Object.freeze({
		minimum: Object.freeze(origin.map((value) => value - margin)),
		maximum: Object.freeze(origin.map(
			(value, axis) => value + shape[axis] * cellSize + margin
		))
	});
}

/** Clamps and reflects one particle against the vessel. */
export function collideSecondaryParticle(position, velocity, bounds, options = {}) {
	const restitution = Math.max(0, Math.min(1, Number(options.restitution ?? 0.32)));
	const friction = Math.max(0, Math.min(1, Number(options.friction ?? 0.12)));
	const nextPosition = [...position];
	const nextVelocity = [...velocity];
	let collided = false;
	for (let axis = 0; axis < 3; axis += 1) {
		if (nextPosition[axis] < bounds.minimum[axis]) {
			nextPosition[axis] = bounds.minimum[axis];
			nextVelocity[axis] = Math.abs(nextVelocity[axis]) * restitution;
			collided = true;
		} else if (nextPosition[axis] > bounds.maximum[axis]) {
			nextPosition[axis] = bounds.maximum[axis];
			nextVelocity[axis] = -Math.abs(nextVelocity[axis]) * restitution;
			collided = true;
		}
	}
	if (collided) {
		for (let axis = 0; axis < 3; axis += 1) {
			nextVelocity[axis] *= axis === 1 ? 1 : 1 - friction;
		}
	}
	return Object.freeze({
		position: Object.freeze(nextPosition),
		velocity: Object.freeze(nextVelocity),
		collided
	});
}
