// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopeGeometry.js
 * @description Builds a chamfered stone cottage envelope with a real recessed entrance.
 */

export function createVillageCottageEnvelope(options, materials, userData) {
	const geometry = createEnvelopeGeometry(options);
	return {
		anisotropy: materials.anisotropy,
		color: '#b8aa91',
		doubleSided: true,
		faces: geometry.faces,
		id: `Awtsmoos_${options.id}`,
		mapRepeat: options.wallRepeat,
		mixPatchScale: 0.07,
		mixPatchSharpness: 0.5,
		mixRepeat: options.wallRepeat,
		mixStrength: 0.3,
		mixTextureUrl: materials.mixStone,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone,
		userData: {
			...userData,
			entranceOpening: geometry.entranceOpening,
			foundationHeight: geometry.foundationHeight,
			part: 'stone-plinth-and-open-recessed-wall-envelope',
			recessDepth: geometry.recessDepth
		},
		vertices: geometry.vertices
	};
}

export function createEnvelopeGeometry(options) {
	const mesh = { faces: [], vertices: [] };
	const halfWidth = options.width / 2;
	const halfDepth = options.depth / 2;
	const foundationHeight = Math.min(0.9, Math.max(0.62, options.wallHeight * 0.16));
	const recessDepth = options.detail === 'far' ? 0.24 : 0.56;
	const wallWidth = halfWidth - 0.14;
	const wallDepth = halfDepth - 0.1;
	const doorwayHalf = Math.min(0.86, wallWidth * 0.2);
	const doorHeight = Math.min(2.35, options.storyHeight ? options.storyHeight * 0.73 : 2.25);
	appendPrism(mesh, chamferedRing(halfWidth + 0.22, halfDepth + 0.22, 0.34), 0, foundationHeight, options);
	appendPrism(
		mesh,
		chamferedRing(wallWidth, wallDepth - recessDepth, 0.4),
		foundationHeight,
		options.wallHeight,
		options,
		4
	);
	appendFrontPier(mesh, -wallWidth, -doorwayHalf, wallDepth, recessDepth, foundationHeight, options);
	appendFrontPier(mesh, doorwayHalf, wallWidth, wallDepth, recessDepth, foundationHeight, options);
	appendFrontLintel(mesh, doorwayHalf, wallDepth, recessDepth, foundationHeight + doorHeight, options);
	return {
		...mesh,
		entranceOpening: Object.freeze({ height: doorHeight, width: doorwayHalf * 2 }),
		foundationHeight,
		recessDepth
	};
}

function appendFrontPier(mesh, startX, endX, frontZ, depth, bottom, options) {
	appendPrism(mesh, rectangle(startX, endX, frontZ - depth, frontZ), bottom, options.wallHeight, options);
}

function appendFrontLintel(mesh, halfWidth, frontZ, depth, bottom, options) {
	appendPrism(mesh, rectangle(-halfWidth, halfWidth, frontZ - depth, frontZ), bottom, options.wallHeight, options);
}

function rectangle(startX, endX, backZ, frontZ) {
	return [[startX, backZ], [endX, backZ], [endX, frontZ], [startX, frontZ]];
}

function chamferedRing(width, depth, chamfer) {
	return [
		[-width + chamfer, -depth], [width - chamfer, -depth],
		[width, -depth + chamfer], [width, depth - chamfer],
		[width - chamfer, depth], [-width + chamfer, depth],
		[-width, depth - chamfer], [-width, -depth + chamfer]
	];
}

function appendPrism(mesh, ring, bottom, top, options, skippedSide = -1) {
	const first = mesh.vertices.length;
	for (const [x, z] of ring) mesh.vertices.push(worldPoint(x, bottom, z, options));
	for (const [x, z] of ring) mesh.vertices.push(worldPoint(x, top, z, options));
	const count = ring.length;
	mesh.faces.push(Array.from({ length: count }, (_value, index) => first + count - index - 1));
	mesh.faces.push(Array.from({ length: count }, (_value, index) => first + count + index));
	for (let index = 0; index < count; index += 1) {
		if (index === skippedSide) continue;
		const next = (index + 1) % count;
		mesh.faces.push([first + index, first + next, first + count + next, first + count + index]);
	}
}

function worldPoint(localX, localY, localZ, options) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return [
		options.x + localX * cosine + localZ * sine,
		options.base + localY,
		options.z - localX * sine + localZ * cosine
	];
}
