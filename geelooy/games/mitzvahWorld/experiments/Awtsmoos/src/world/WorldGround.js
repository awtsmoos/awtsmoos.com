// B"H
import {
	normalize,
	v
} from '../math/Geometry3D.js';
import { Ray } from '../math/Ray.js';
import { GroundSampleCache } from './GroundSampleCache.js';

/**
 * Searches for ground from the player's vertical context. Exact repeated
 * questions are remembered, while every changed coordinate or world identity
 * opens a fresh path through terrain and collision.
 */
export class WorldGround {
	constructor({ terrainHeightAt, octree, top = 42 }) {
		this.terrainHeightAt = terrainHeightAt;
		this.octree = octree;
		this.top = top;
		this.sampleCache = new GroundSampleCache();
	}

	sample(x, z, options = {}) {
		const maximumY = Number.isFinite(options.maxY)
			? options.maxY
			: this.top;
		if (!cacheableOptions(options)) {
			return this.computeSample(x, z, maximumY);
		}
		return this.sampleCache.resolve({
			x,
			z,
			maximumY,
			octree: this.octree,
			terrainHeightAt: this.terrainHeightAt,
			create: () => this.computeSample(x, z, maximumY)
		});
	}

	heightAt(x, z, options = {}) {
		return this.sample(x, z, options).height;
	}

	isGrounded(position, footOffset = 0, epsilon = 0.055) {
		const feetY = position.y - footOffset;
		const ground = this.heightAt(position.x, position.z, {
			maxY: feetY + epsilon
		});
		return feetY <= ground + epsilon;
	}

	terrainNormal(x, z) {
		const epsilon = 0.08;
		const heightAt = this.terrainHeightAt;
		return normalize(v(
			heightAt(x - epsilon, z) - heightAt(x + epsilon, z),
			2 * epsilon,
			heightAt(x, z - epsilon) - heightAt(x, z + epsilon)
		));
	}

	computeSample(x, z, maximumY) {
		const terrain = this.terrainSample(x, z);
		const originY = Math.max(
			terrain.height + 0.04,
			Math.min(this.top, maximumY + 0.04)
		);
		const maximumDistance = Math.max(
			0.08,
			originY - terrain.height + 2
		);
		const hit = this.octree?.raycast(
			new Ray({ x, y: originY, z }, { x: 0, y: -1, z: 0 }),
			maximumDistance,
			floorOnly
		);
		if (!hit || hit.point.y < terrain.height - 0.001) return terrain;
		return {
			height: hit.point.y,
			normal: hit.item.normal,
			kind: hit.item.kind,
			source: 'octree-bounded-floor-ray'
		};
	}

	terrainSample(x, z) {
		return {
			height: this.terrainHeightAt(x, z),
			normal: this.terrainNormal(x, z),
			kind: 'terrain',
			source: 'terrain-height'
		};
	}
}

function cacheableOptions(options) {
	return Object.keys(options).every((key) => key === 'maxY');
}

function floorOnly(item) {
	return item.solid && item.floor && item.normal?.y > 0.24;
}
