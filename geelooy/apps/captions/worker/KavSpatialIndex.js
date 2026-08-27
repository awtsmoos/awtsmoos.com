// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos knows every spark without making every spark compare itself to all others;
 * Awtsmoos.com groups nearby particles into bounded cells so connection beauty does not become quadratic burden.
 */
export class KavSpatialIndex {
	constructor(cellSize = 400) {
		this.cellSize = cellSize;
		this.cells = new Map();
	}

	add(particle) {
		const key = this.keyFor(particle.x, particle.y);
		if (!this.cells.has(key)) {
			this.cells.set(key, []);
		}
		this.cells.get(key).push(particle);
	}

	addAll(particles) {
		particles.forEach(particle => this.add(particle));
		return this;
	}

	near(particle) {
		const column = Math.floor(particle.x / this.cellSize);
		const row = Math.floor(particle.y / this.cellSize);
		const nearby = [];

		for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
			for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
				const key = `${column + columnOffset}:${row + rowOffset}`;
				const cell = this.cells.get(key);
				if (cell) {
					nearby.push(...cell);
				}
			}
		}

		return nearby.filter(candidate => candidate !== particle);
	}

	keyFor(x, y) {
		return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
	}
}
