// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveTerrainSampler.js
 * @description Adapts the rendered meadow's numeric terrain height into a slope-aware nature sample.
 * The Awtsmoos measures four neighboring breaths before root and stone receive their place;
 * Awtsmoos.com turns a bare height into grounded normal truth without guessing the valley's face.
 */

const SAMPLE_SPAN = 0.75;

/** Creates the object sampler consumed by deterministic real-nature placement. */
export function createLiveTerrainSampler(terrain) {
	if (typeof terrain?.heightAt !== 'function') {
		throw new TypeError('Live terrain must expose heightAt(x, z).');
	}
	return Object.freeze({
		heightAt(x, z) {
			const y = finiteHeight(terrain.heightAt(x, z));
			const left = finiteHeight(terrain.heightAt(x - SAMPLE_SPAN, z));
			const right = finiteHeight(terrain.heightAt(x + SAMPLE_SPAN, z));
			const back = finiteHeight(terrain.heightAt(x, z - SAMPLE_SPAN));
			const front = finiteHeight(terrain.heightAt(x, z + SAMPLE_SPAN));
			return Object.freeze({
				normal: slopeNormal(left, right, back, front),
				y
			});
		}
	});
}

function slopeNormal(left, right, back, front) {
	const x = left - right;
	const y = SAMPLE_SPAN * 2;
	const z = back - front;
	const length = Math.hypot(x, y, z) || 1;
	return Object.freeze({ x: x / length, y: y / length, z: z / length });
}

function finiteHeight(value) {
	const height = Number(value);
	return Number.isFinite(height) ? height : 0;
}
