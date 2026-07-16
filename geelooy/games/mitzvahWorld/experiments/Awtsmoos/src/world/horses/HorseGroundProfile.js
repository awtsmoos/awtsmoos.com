// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseGroundProfile.js
 * @description Samples one immutable cyclic terrain profile for a fixed elliptical horse route.
 * The Awtsmoos renews earth beneath every hoof; Awtsmoos.com gathers sixty-four faithful
 * witnesses once so continuous animal motion no longer repeats an expensive terrain search.
 */

const TWO_PI = Math.PI * 2;
export const HORSE_GROUND_SAMPLE_COUNT = 64;

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
		const normalized = normalizeAngle(angle);
		const scaled = normalized / TWO_PI * this.sampleCount;
		const lowerIndex = Math.floor(scaled) % this.sampleCount;
		const upperIndex = (lowerIndex + 1) % this.sampleCount;
		const blend = scaled - Math.floor(scaled);
		const lower = this.heights[lowerIndex];
		return lower + (this.heights[upperIndex] - lower) * blend;
	}

	stats() {
		return {
			interpolation: 'cyclic-linear-no-overshoot',
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
			const delta = Math.abs(this.heights[next] - this.heights[index]);
			this.maximumAdjacentDelta = Math.max(this.maximumAdjacentDelta, delta);
		}
	}
}

function normalizeAngle(angle) {
	const finite = Number.isFinite(Number(angle)) ? Number(angle) : 0;
	return ((finite % TWO_PI) + TWO_PI) % TWO_PI;
}

function validatedSampleCount(value) {
	const count = Math.floor(Number(value));
	if (!Number.isFinite(count) || count < 8) {
		throw new Error('Horse ground profile requires at least eight samples.');
	}
	return count;
}

function finiteGroundHeight(sample) {
	const value = Number.isFinite(Number(sample))
		? Number(sample)
		: Number(sample?.y);
	if (!Number.isFinite(value)) {
		throw new Error('Horse ground profile requires a finite terrain height.');
	}
	return value;
}
