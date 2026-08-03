// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YardGrassMeshBuilder.js
 * @description Appends curved blades, seed wisps, and multi-petal accents into one manual yard mesh.
 * The Awtsmoos lets every tuft hold many gestures while the renderer receives one finite vessel;
 * Awtsmoos.com preserves UVs, triangle accounting, curved tips, and zero collider ownership.
 */

export function appendYardGrassTuft(mesh, tuft) {
	let seedHeadCount = 0;
	for (const blade of tuft.blades) {
		appendBlade(mesh, blade);
		if (blade.seedHead) {
			appendSeedHead(mesh, blade);
			seedHeadCount += 1;
		}
	}
	if (tuft.flower) appendFlower(mesh, tuft.flower);
	return Object.freeze({
		bladeCount: tuft.blades.length,
		flowerCount: tuft.flower ? 1 : 0,
		seedHeadCount
	});
}

function appendBlade(mesh, blade) {
	const cosine = Math.cos(blade.yaw);
	const sine = Math.sin(blade.yaw);
	const sideX = cosine * blade.width;
	const sideZ = sine * blade.width;
	const forwardX = -sine * blade.lean;
	const forwardZ = cosine * blade.lean;
	const waistY = blade.y + blade.height * 0.52;
	const tipY = blade.y + blade.height;
	const start = mesh.vertices.length;
	mesh.vertices.push(
		[blade.x - sideX, blade.y, blade.z - sideZ],
		[blade.x + sideX, blade.y, blade.z + sideZ],
		[blade.x + sideX * 0.58 + forwardX * 0.45, waistY,
			blade.z + sideZ * 0.58 + forwardZ * 0.45],
		[blade.x - sideX * 0.58 + forwardX * 0.35, waistY,
			blade.z - sideZ * 0.58 + forwardZ * 0.35],
		[blade.x + forwardX, tipY, blade.z + forwardZ]
	);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.faces.push([start + 3, start + 2, start + 4]);
	mesh.uvs.push(0, 0, 1, 0, 0.82, 0.62, 0.18, 0.62, 0.5, 1);
}

function appendSeedHead(mesh, blade) {
	const topY = blade.y + blade.height;
	const start = mesh.vertices.length;
	const sideX = Math.cos(blade.yaw) * blade.width * 1.8;
	const sideZ = Math.sin(blade.yaw) * blade.width * 1.8;
	mesh.vertices.push(
		[blade.x - sideX, topY - 0.04, blade.z - sideZ],
		[blade.x + sideX, topY - 0.04, blade.z + sideZ],
		[blade.x + sideX * 0.42, topY + 0.12, blade.z + sideZ * 0.42],
		[blade.x - sideX * 0.42, topY + 0.12, blade.z - sideZ * 0.42]
	);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(0, 0, 1, 0, 0.74, 1, 0.26, 1);
}

function appendFlower(mesh, flower) {
	const center = [flower.x, flower.y + flower.radius * 0.24, flower.z];
	for (let petal = 0; petal < flower.petalCount; petal += 1) {
		const angle = flower.yaw + petal * Math.PI * 2 / flower.petalCount;
		const tangent = angle + Math.PI / 2;
		const radius = flower.radius;
		const start = mesh.vertices.length;
		mesh.vertices.push(
			center,
			[flower.x + Math.cos(tangent) * radius * 0.32, flower.y,
				flower.z + Math.sin(tangent) * radius * 0.32],
			[flower.x + Math.cos(angle) * radius, flower.y + radius * 0.18,
				flower.z + Math.sin(angle) * radius],
			[flower.x - Math.cos(tangent) * radius * 0.32, flower.y,
				flower.z - Math.sin(tangent) * radius * 0.32]
		);
		mesh.faces.push([start, start + 1, start + 2, start + 3]);
		mesh.uvs.push(0.5, 0.5, 0, 0, 0.5, 1, 1, 0);
	}
}
