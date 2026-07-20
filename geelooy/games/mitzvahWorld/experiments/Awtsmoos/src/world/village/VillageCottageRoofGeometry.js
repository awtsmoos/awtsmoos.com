// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageRoofGeometry.js
 * @description Builds one closed, thick, ridge-roof mesh for each district cottage.
 * The Awtsmoos draws shelter from two slopes meeting as one ridge; Awtsmoos.com gives
 * every roof eaves, fascia, gables, underside, physical depth, and batch-stable tiling.
 */

export function createVillageCottageRoof(options) {
	const halfWidth = (options.width + 1.45) / 2;
	const halfDepth = (options.depth + 1.35) / 2;
	const thickness = 0.34;
	const geometry = roofGeometry(
		halfWidth,
		halfDepth,
		options.roofRise,
		thickness,
		options.texturePolicy?.tileWorld
	);
	return {
		color: '#4f4a43',
		doubleSided: true,
		faces: geometry.faces,
		id: `Awtsmoos_${options.id}-roof`,
		mapRepeat: options.mapRepeat,
		mixPatchScale: 0.055,
		mixPatchSharpness: 0.48,
		mixRepeat: options.mapRepeat,
		mixStrength: 0.24,
		mixTextureUrl: options.mixTextureUrl,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: options.texturePolicy,
		textureUrl: options.textureUrl,
		userData: {
			AwtsmoosLod: { className: 'architecture' },
			family: 'reference-village-cottage-roof',
			part: 'closed-ridge-roof',
			roofThickness: thickness
		},
		uvs: geometry.uvs,
		vertices: geometry.vertices.map((point) => worldPoint(point, options))
	};
}

function roofGeometry(width, depth, rise, thickness, tileWorld) {
	const tile = Math.max(0.25, tileWorld || 4);
	const slope = Math.hypot(width, rise);
	const mesh = { faces: [], uvs: [], vertices: [] };
	const point = {
		backLeft: [-width, 0, -depth],
		backRight: [width, 0, -depth],
		backRidge: [0, rise, -depth],
		frontLeft: [-width, 0, depth],
		frontRight: [width, 0, depth],
		frontRidge: [0, rise, depth],
		lowerBackLeft: [-width, -thickness, -depth],
		lowerBackRight: [width, -thickness, -depth],
		lowerFrontLeft: [-width, -thickness, depth],
		lowerFrontRight: [width, -thickness, depth]
	};
	appendFace(mesh, [point.backLeft, point.frontLeft, point.frontRidge, point.backRidge], tile,
		([x, y, z]) => [z, (x * width + y * rise) / slope]);
	appendFace(mesh, [point.backRidge, point.frontRidge, point.frontRight, point.backRight], tile,
		([x, y, z]) => [z, (x * width - y * rise) / slope]);
	appendFace(mesh, [point.backLeft, point.backRidge, point.backRight], tile,
		([x, y]) => [x, y]);
	appendFace(mesh, [point.frontLeft, point.frontRight, point.frontRidge], tile,
		([x, y]) => [x, y]);
	appendFace(mesh, [point.lowerBackLeft, point.lowerBackRight, point.lowerFrontRight, point.lowerFrontLeft], tile,
		([x, _y, z]) => [x, z]);
	appendFace(mesh, [point.backLeft, point.backRight, point.lowerBackRight, point.lowerBackLeft], tile,
		([x, y]) => [x, y]);
	appendFace(mesh, [point.frontLeft, point.lowerFrontLeft, point.lowerFrontRight, point.frontRight], tile,
		([x, y]) => [x, y]);
	appendFace(mesh, [point.backLeft, point.lowerBackLeft, point.lowerFrontLeft, point.frontLeft], tile,
		([_x, y, z]) => [z, y]);
	appendFace(mesh, [point.backRight, point.frontRight, point.lowerFrontRight, point.lowerBackRight], tile,
		([_x, y, z]) => [z, y]);
	return mesh;
}

function appendFace(mesh, points, tile, project) {
	const first = mesh.vertices.length;
	const projected = points.map(project);
	const minU = Math.min(...projected.map(([u]) => u));
	const minV = Math.min(...projected.map(([, value]) => value));
	for (let index = 0; index < points.length; index += 1) {
		mesh.vertices.push(points[index]);
		mesh.uvs.push(
			(projected[index][0] - minU) / tile,
			(projected[index][1] - minV) / tile
		);
	}
	mesh.faces.push(points.map((_point, index) => first + index));
}

function worldPoint(point, options) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return [
		options.x + point[0] * cosine + point[2] * sine,
		options.base + options.wallHeight + point[1],
		options.z - point[0] * sine + point[2] * cosine
	];
}
