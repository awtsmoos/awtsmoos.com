// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBotanicalGeometry.js
 * @description Appends colored segmented blades, leaves, layered petals, centers, and seed heads.
 * The Awtsmoos reveals botanical intricacy through two finite meshes;
 * Awtsmoos.com preserves deterministic shape, terrain contact, UV continuity, RGBA truth, and bounds.
 */

export function appendMinimalMeadowBlade(target, options) {
	const segments = Math.max(2, Math.min(4, options.segments || 3));
	const sideX = Math.cos(options.angle) * options.width;
	const sideZ = Math.sin(options.angle) * options.width;
	let previousLeft = [options.x - sideX, options.y, options.z - sideZ];
	let previousRight = [options.x + sideX, options.y, options.z + sideZ];
	for (let segment = 1; segment <= segments; segment += 1) {
		const t = segment / segments;
		const taper = Math.max(0.08, 1 - t * 0.86);
		const bend = options.bend * t * t;
		const centerX = options.x + Math.cos(options.angle + Math.PI / 2) * bend;
		const centerZ = options.z + Math.sin(options.angle + Math.PI / 2) * bend;
		const left = [centerX - sideX * taper, options.y + options.height * t, centerZ - sideZ * taper];
		const right = [centerX + sideX * taper, options.y + options.height * t, centerZ + sideZ * taper];
		appendFace(target, [previousLeft, previousRight, right, left], options.color);
		previousLeft = left;
		previousRight = right;
	}
}

export function appendMinimalMeadowLeafPair(target, options) {
	appendBlade(target, options, options.angle + 0.72, 0.42, options.leafColor);
	appendBlade(target, options, options.angle - 0.72, 0.5, options.leafColor);
}

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

export function appendMinimalMeadowSeedHead(target, options) {
	for (let index = 0; index < 5; index += 1) {
		const angle = options.rotation + index * Math.PI * 2 / 5;
		appendPetal(target, options, angle, options.radius * 0.54, 1, options.centerColor);
	}
}

function appendBlade(target, options, angle, heightScale, color) {
	appendMinimalMeadowBlade(target, {
		angle, bend: options.radius * 0.42, color, height: options.height * heightScale,
		segments: 2, width: options.radius * 0.22, x: options.x, y: options.y, z: options.z
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
