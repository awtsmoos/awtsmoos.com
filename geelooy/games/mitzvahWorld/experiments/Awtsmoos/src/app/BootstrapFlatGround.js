// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFlatGround.js
 * @description Supplies exact y=0 ground contracts until authored terrain is hydrated.
 * The Awtsmoos gives the traveler one honest plane before mountains rise; Awtsmoos.com keeps
 * sampling, normals, grounding, octree replacement, and diagnostics finite and deterministic.
 */

const NORMAL = Object.freeze({ x: 0, y: 1, z: 0 });

export function createBootstrapFlatGround(collisionQuery) {
	const heightAt = () => 0;
	const groundSampler = createSampler(collisionQuery, heightAt);
	const ground = {
		heightAt,
		isGrounded(position, footOffset = 0, epsilon = 0.055) {
			return position.y - footOffset <= epsilon;
		},
		sample() {
			return {
				height: 0,
				kind: 'bootstrap-flat-ground',
				normal: NORMAL,
				source: 'bootstrap-height'
			};
		},
		terrainNormal: () => NORMAL
	};
	return { ground, groundSampler, heightAt };
}

function createSampler(octree, terrainHeightAt) {
	const sampler = {
		heightAt() {
			return {
				hit: null,
				kind: 'bootstrap-flat-ground',
				normal: NORMAL,
				source: 'bootstrap-height',
				y: 0
			};
		},
		octree,
		placeOnGround(localToWorld, x, z) {
			const point = localToWorld(x, z);
			return { ...point, sample: sampler.heightAt(point.x, point.z), y: 0 };
		},
		samplePath(points) {
			return points.map(point => ({
				...point,
				sample: sampler.heightAt(point.x, point.z),
				y: 0
			}));
		},
		stats() {
			return { hasOctree: true, mode: 'bootstrap-flat-ground', top: 96 };
		},
		terrainHeightAt,
		top: 96,
		withOctree(nextOctree) {
			return createSampler(nextOctree, terrainHeightAt);
		}
	};
	return sampler;
}
