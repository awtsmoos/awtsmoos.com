// B"H
// Boruch Hashem
// Blessed is He
/**
 * Local water knowledge is gathered through a bounded spatial hash. The
 * Awtsmoos lets each particle meet nearby companions without an O(n²) ocean.
 */
function key(position, inverseCellSize) {
	return position.map(value => Math.floor(value * inverseCellSize)).join(",");
}

function cellCoordinates(position, inverseCellSize) {
	return position.map(value => Math.floor(value * inverseCellSize));
}

/** Builds deterministic capped neighbor lists in expected O(p + neighbors). */
export function buildLiquidNeighborhood3d(particles, radius, maximumNeighbors = 48) {
	const safeRadius = Math.max(1e-6, Number(radius));
	const inverse = 1 / safeRadius;
	const cells = new Map();
	for (let index = 0; index < particles.length; index += 1) {
		const cellKey = key(particles[index].position, inverse);
		if (!cells.has(cellKey)) cells.set(cellKey, []);
		cells.get(cellKey).push(index);
	}
	return Object.freeze(particles.map((particle, index) => {
		const base = cellCoordinates(particle.position, inverse);
		const neighbors = [];
		for (let x = -1; x <= 1; x += 1) for (let y = -1; y <= 1; y += 1) for (let z = -1; z <= 1; z += 1) {
			const candidates = cells.get(`${base[0] + x},${base[1] + y},${base[2] + z}`) ?? [];
			for (const candidateIndex of candidates) {
				if (candidateIndex === index) continue;
				const candidate = particles[candidateIndex];
				const delta = candidate.position.map((value, axis) => value - particle.position[axis]);
				const distance = Math.hypot(...delta);
				if (distance > safeRadius || distance < 1e-9) continue;
				neighbors.push({ index: candidateIndex, distance, delta, q: distance / safeRadius });
			}
		}
		neighbors.sort((left, right) => left.distance - right.distance || String(particles[left.index].id).localeCompare(String(particles[right.index].id)));
		return Object.freeze(neighbors.slice(0, maximumNeighbors).map(Object.freeze));
	}));
}
