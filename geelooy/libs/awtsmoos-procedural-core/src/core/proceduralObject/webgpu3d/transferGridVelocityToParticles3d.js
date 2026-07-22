// B"H
// Boruch Hashem
// Blessed is He
/** The normalized grid speaks back through trilinear PIC sampling and bounded integration. */

function particlesFrom(value) {
	const particles = Array.isArray(value) ? value : value?.particles;
	if (!Array.isArray(particles)) {
		throw new TypeError("Grid transfer requires particles or a particle system.");
	}
	return particles;
}

function inside(layout, coordinate) {
	return coordinate.every((value, axis) => (
		value >= 0 && value < layout.dimensions[axis]
	));
}

function cellIndex(layout, coordinate) {
	return coordinate[0] + layout.dimensions[0] * (
		coordinate[1] + layout.dimensions[1] * coordinate[2]
	);
}

export function sampleGridVelocity3d(grid, position) {
	if (!(grid?.values instanceof Float32Array)
		|| grid.values.length !== grid.layout?.cellCount * 4) {
		throw new TypeError("Grid sampling requires normalized Float32Array velocity values.");
	}
	const gridPosition = position.map((value, axis) => (
		(Number(value) - grid.layout.origin[axis]) / grid.layout.cellSize
	));
	if (gridPosition.some(value => !Number.isFinite(value))) {
		throw new TypeError("Grid sampling position must contain finite values.");
	}
	const base = gridPosition.map(Math.floor);
	const fraction = gridPosition.map((value, axis) => value - base[axis]);
	const velocity = [0, 0, 0];
	let occupiedWeight = 0;
	for (let z = 0; z < 2; z += 1) {
		for (let y = 0; y < 2; y += 1) {
			for (let x = 0; x < 2; x += 1) {
				const coordinate = [base[0] + x, base[1] + y, base[2] + z];
				if (!inside(grid.layout, coordinate)) continue;
				const offset = cellIndex(grid.layout, coordinate) * 4;
				if (grid.values[offset + 3] <= 0) continue;
				const weight = [x, y, z].reduce((product, side, axis) => (
					product * (side === 0 ? 1 - fraction[axis] : fraction[axis])
				), 1);
				for (let axis = 0; axis < 3; axis += 1) {
					velocity[axis] += grid.values[offset + axis] * weight;
				}
				occupiedWeight += weight;
			}
		}
	}
	return Object.freeze({
		velocity: Object.freeze(velocity.map(value => (
			occupiedWeight > 0 ? value / occupiedWeight : 0
		))),
		occupiedWeight
	});
}

function resolveBounds(position, velocity, radius, input) {
	const minimum = input.boundsMin ?? [-Infinity, -Infinity, -Infinity];
	const maximum = input.boundsMax ?? [Infinity, Infinity, Infinity];
	for (let axis = 0; axis < 3; axis += 1) {
		const lower = Number(minimum[axis]) + radius;
		const upper = Number(maximum[axis]) - radius;
		if (position[axis] < lower) {
			position[axis] = lower;
			velocity[axis] = Math.abs(velocity[axis]) * input.restitution;
		}
		if (position[axis] > upper) {
			position[axis] = upper;
			velocity[axis] = -Math.abs(velocity[axis]) * input.restitution;
		}
	}
}

export function transferGridVelocityToParticles3d(particlesInput, grid, options = {}) {
	const deltaTime = Number(options.deltaTime ?? 0);
	const damping = Number(options.damping ?? 1);
	const restitution = Number(options.restitution ?? 0);
	const picBlend = Math.max(0, Math.min(1, Number(options.picBlend ?? 1)));
	if (![deltaTime, damping, restitution, picBlend].every(Number.isFinite)
		|| deltaTime < 0 || damping < 0 || restitution < 0) {
		throw new TypeError("PIC transfer parameters must be finite and nonnegative.");
	}
	const particles = particlesFrom(particlesInput).map(particle => {
		const oldVelocity = particle.velocity.map(Number);
		const sampled = sampleGridVelocity3d(grid, particle.position);
		const target = sampled.occupiedWeight > 0 ? sampled.velocity : oldVelocity;
		const velocity = oldVelocity.map((value, axis) => (
			(value * (1 - picBlend) + target[axis] * picBlend) * damping
		));
		const position = particle.position.map((value, axis) => (
			Number(value) + velocity[axis] * deltaTime
		));
		resolveBounds(position, velocity, Number(particle.size ?? 0), {
			...options,
			restitution
		});
		return Object.freeze({
			...particle,
			position: Object.freeze(position),
			velocity: Object.freeze(velocity),
			age: Number(particle.age ?? 0) + deltaTime
		});
	});
	return Object.freeze({
		schema: "awtsmoos.pic-particle-transfer-3d",
		picBlend,
		particles: Object.freeze(particles)
	});
}
