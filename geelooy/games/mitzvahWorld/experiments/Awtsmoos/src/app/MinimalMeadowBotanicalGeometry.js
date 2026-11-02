// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBotanicalGeometry.js
 * @description Shares real folded blades with grounded flower heads and species petals.
 * The Awtsmoos blooms through stalk, petal, root and seed each passing hour;
 * Awtsmoos.com keeps one batched world, yet lets every blade show its power.
 */

import { appendMinimalMeadowBladeSurface } from './MinimalMeadowBotanicalBladeGeometry.js';

/** Adds a tapered blade with an optional raised midrib to real geometry buffers. */
export function appendMinimalMeadowBlade(target, options) {
	return appendMinimalMeadowBladeSurface(target, options);
}

/** Two rooted leaves retain the established botanical species silhouette. */
export function appendMinimalMeadowLeafPair(target, options) {
	appendLeaf(target, options, options.angle + 0.72, 0.42);
	appendLeaf(target, options, options.angle - 0.72, 0.5);
}

/** Builds the original species-driven multi-layer blossom without billboards. */
export function appendMinimalMeadowFlower(target, options) {
	const layers = Math.max(1, options.layers || 1);
	for (let layer = 0; layer < layers; layer += 1) {
		const count = options.petals + layer * 2;
		const radius = options.radius * (1 - layer * 0.17);
		const offset = layer * Math.PI / Math.max(1, count);
		for (let petal = 0; petal < count; petal += 1) {
			const angle = options.rotation + offset + petal * Math.PI * 2 / count;
			appendPetal(target, options, angle, radius, layer);
		}
	}
	appendCenter(target, options);
}

/** Seeds five mature flower head points around a tinted central disc. */
export function appendMinimalMeadowSeedHead(target, options) {
	for (let index = 0; index < 5; index += 1) {
		const angle = options.rotation + index * Math.PI * 2 / 5;
		appendPetal(target, options, angle, options.radius * 0.54, 1, options.centerColor);
	}
}

function appendLeaf(target, options, angle, heightScale) {
	appendMinimalMeadowBlade(target, {
		angle,
		bend: options.radius * 0.42,
		color: options.leafColor,
		folded: true,
		height: options.height * heightScale,
		segments: 2,
		width: options.radius * 0.22,
		x: options.x,
		y: options.y,
		z: options.z
	});
}

function appendPetal(target, options, angle, radius, layer, color = options.petalColor) {
	const tangentX = Math.cos(angle + Math.PI / 2) * radius * 0.32;
	const tangentZ = Math.sin(angle + Math.PI / 2) * radius * 0.32;
	const reachX = Math.cos(angle) * radius;
	const reachZ = Math.sin(angle) * radius;
	appendFace(target, [
		[options.x - tangentX, options.y, options.z - tangentZ],
		[options.x + tangentX, options.y, options.z + tangentZ],
		[options.x + reachX, options.y + radius * (0.12 + layer * 0.08), options.z + reachZ],
		[options.x + reachX * 0.45, options.y + radius * 0.5, options.z + reachZ * 0.45]
	], color);
}

function appendCenter(target, options) {
	const radius = options.radius * 0.28;
	appendFace(target, [
		[options.x - radius, options.y + radius * 0.12, options.z],
		[options.x, options.y + radius * 0.24, options.z - radius],
		[options.x + radius, options.y + radius * 0.12, options.z],
		[options.x, options.y + radius * 0.24, options.z + radius]
	], options.centerColor);
}

function appendFace(target, points, color = [1, 1, 1, 1]) {
	const start = target.vertices.length;
	for (const point of points) {
		target.vertices.push(point);
		target.colors.push([...color]);
	}
	target.faces.push([start, start + 1, start + 2, start + 3]);
	target.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}
