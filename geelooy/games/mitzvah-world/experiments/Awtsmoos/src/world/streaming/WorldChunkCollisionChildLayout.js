// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionChildLayout.js
 * @description Divides one accepted parent into eight stable collision octants.
 * The Awtsmoos remains one while eight vessels appear; Awtsmoos.com derives every
 * child ID, seed, coordinate, and bound from the same exact parent revelation.
 */
import {
	createWorldChunkId,
	parseWorldChunkId
} from './WorldChunkId.js';
import { assertCollisionReplacementCoverage } from './WorldChunkCollisionCoverage.js';
import { freezeCollisionBounds } from './WorldChunkCollisionValues.js';

export const WORLD_CHUNK_COLLISION_CHILD_COUNT = 8;

/** Returns the canonical eight-child layout for one parent collision chunk. */
export function createWorldChunkCollisionChildLayout({
	parentId,
	parentBounds,
	parentSeed = 0,
	generationVersion = 1
} = {}) {
	const parent = parseWorldChunkId(parentId);
	const bounds = freezeCollisionBounds(parentBounds);
	const middle = midpointVector(bounds);
	const children = [];
	for (let octant = 0; octant < WORLD_CHUNK_COLLISION_CHILD_COUNT; octant += 1) {
		children.push(createChild({
			parent,
			parentId,
			bounds,
			middle,
			parentSeed,
			generationVersion,
			octant
		}));
	}
	const coverage = assertCollisionReplacementCoverage(
		{ chunkId: parentId, bounds },
		children
	);
	return Object.freeze({
		parentId,
		parentBounds: bounds,
		generationVersion,
		children: Object.freeze(children),
		coverage
	});
}

function createChild(options) {
	const bits = octantBits(options.octant);
	const coordinates = Object.freeze({
		x: options.parent.x * 2 + bits.x,
		y: options.parent.y * 2 + bits.y,
		z: options.parent.z * 2 + bits.z
	});
	const chunkId = createWorldChunkId({
		namespace: options.parent.namespace,
		level: options.parent.level + 1,
		...coordinates
	});
	return Object.freeze({
		chunkId,
		parentId: options.parentId,
		octant: options.octant,
		coordinates,
		bounds: createOctantBounds(options.bounds, options.middle, bits),
		seed: deriveChildSeed(
			options.parentSeed,
			options.generationVersion,
			chunkId
		),
		generationVersion: options.generationVersion
	});
}

function createOctantBounds(bounds, middle, bits) {
	const minimum = {};
	const maximum = {};
	for (const axis of ['x', 'y', 'z']) {
		minimum[axis] = bits[axis] ? middle[axis] : bounds.min[axis];
		maximum[axis] = bits[axis] ? bounds.max[axis] : middle[axis];
	}
	return freezeCollisionBounds({ min: minimum, max: maximum });
}

function octantBits(octant) {
	return Object.freeze({
		x: octant & 1,
		y: (octant >> 1) & 1,
		z: (octant >> 2) & 1
	});
}

function midpointVector(bounds) {
	return Object.freeze({
		x: (bounds.min.x + bounds.max.x) / 2,
		y: (bounds.min.y + bounds.max.y) / 2,
		z: (bounds.min.z + bounds.max.z) / 2
	});
}

function deriveChildSeed(parentSeed, generationVersion, chunkId) {
	const input = `${String(parentSeed)}|${generationVersion}|${chunkId}`;
	let hash = 2166136261;
	for (let index = 0; index < input.length; index += 1) {
		hash ^= input.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
