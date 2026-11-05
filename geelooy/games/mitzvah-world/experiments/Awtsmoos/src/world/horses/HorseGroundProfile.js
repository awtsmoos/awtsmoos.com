// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseGroundProfile.js
 * @description Samples one immutable cyclic terrain profile for a fixed elliptical horse route.
 * The Awtsmoos renews earth beneath every hoof; Awtsmoos.com gathers a dense ring of witnesses
 * once, then uses smooth cyclic interpolation without repeating terrain work during animation.
 */

const TWO_PI = Math.PI * 2;
export const HORSE_GROUND_SAMPLE_COUNT = 2048;

export class HorseGroundProfile {
	constructor(ground, route, options = {}) {
		this.routeId = route.id;
		this.sampleCount = validatedSampleCount(
			options.sampleCount || HORSE_GROUND_SAMPLE_COUNT
		);
		this.heights = new Float64Array(this.sampleCount);
		this.terrainQueries = 0;
		this.minimumHeight = Infinity;
		this.maximumHeight = -Infinity;
		this.maximumAdjacentDelta = 0;
		this.sampleGround(ground, route);
		this.measureAdjacentDelta();
	}

	heightAt(angle) {
		const scaled = normalizeAngle(angle) / TWO_PI * this.sampleCount;
		const base = Math.floor(scaled);
		const amount = scaled - base;
		return cyclicCatmullRom(
			this.heights[wrap(base - 1, this.sampleCount)],
			this.heights[wrap(base, this.sampleCount)],
			this.heights[wrap(base + 1, this.sampleCount)],
			this.heights[wrap(base + 2, this.sampleCount)],
			amount
		);
	}

	stats() {
		return {
			interpolation: 'cyclic-catmull-rom',
			maximumAdjacentDelta: this.maximumAdjacentDelta,
			maximumHeight: this.maximumHeight,
			minimumHeight: this.minimumHeight,
			routeId: this.routeId,
			sampleCount: this.sampleCount,
			sampleSpacingRadians: TWO_PI / this.sampleCount,
			terrainQueries: this.terrainQueries
		};
	}

	sampleGround(ground, route) {
		for (let index = 0; index < this.sampleCount; index += 1) {
			const angle = index / this.sampleCount * TWO_PI;
			const x = route.centerX + Math.cos(angle) * route.radiusX;
			const z = route.centerZ + Math.sin(angle) * route.radiusZ;
			const height = finiteGroundHeight(ground.heightAt(x, z));
			this.heights[index] = height;
			this.terrainQueries += 1;
			this.minimumHeight = Math.min(this.minimumHeight, height);
			this.maximumHeight = Math.max(this.maximumHeight, height);
		}
	}

	measureAdjacentDelta() {
		for (let index = 0; index < this.sampleCount; index += 1) {
			const next = (index + 1) % this.sampleCount;
			this.maximumAdjacentDelta = Math.max(
				this.maximumAdjacentDelta,
				Math.abs(this.heights[next] - this.heights[index])
			);
		}
	}
}

function cyclicCatmullRom(a, b, c, d, amount) {
	const squared = amount * amount;
	const cubed = squared * amount;
	return 0.5 * (
		2 * b
		+ (-a + c) * amount
		+ (2 * a - 5 * b + 4 * c - d) * squared
		+ (-a + 3 * b - 3 * c + d) * cubed
	);
}

function normalizeAngle(angle) {
	const finite = Number.isFinite(Number(angle)) ? Number(angle) : 0;
	return ((finite % TWO_PI) + TWO_PI) % TWO_PI;
}

function wrap(index, count) {
	return ((index % count) + count) % count;
}

function validatedSampleCount(value) {
	const count = Math.floor(Number(value));
	if (!Number.isFinite(count) || count < 8) {
		throw new Error('Horse ground profile requires at least eight samples.');
	}
	return count;
}

function finiteGroundHeight(sample) {
	const value = Number.isFinite(Number(sample)) ? Number(sample) : Number(sample?.y);
	if (!Number.isFinite(value)) {
		throw new Error('Horse ground profile requires a finite terrain height.');
	}
	return value;
}
