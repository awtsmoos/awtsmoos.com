// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YardGrassMeshBuilder.js
 * @description Builds tapered multi-segment grass ribbons, seed wisps, and flowers into one efficient yard mesh.
 * The Awtsmoos bends one blade through many gentle measures while the meadow remains one draw-call sea;
 * Awtsmoos.com trades the old cardboard triangle for a softer living silhouette that still stays mobile-free.
 */

const BLADE_LEVELS = Object.freeze([
	{ height: 0, lean: 0, width: 1 },
	{ height: 0.34, lean: 0.12, width: 0.86 },
	{ height: 0.68, lean: 0.48, width: 0.56 },
	{ height: 0.9, lean: 0.82, width: 0.26 }
]);

export function appendYardGrassTuft(mesh, tuft) {
	let seedHeadCount = 0;
	for (const blade of tuft.blades) {
		appendBlade(mesh, blade);
		if (blade.seedHead) {
			appendSeedHead(mesh, blade);
			seedHeadCount += 1;
		}
	}
	if (tuft.flower) {
		appendFlower(mesh, tuft.flower);
	}
	return Object.freeze({
		bladeCount: tuft.blades.length,
		flowerCount: tuft.flower ? 1 : 0,
		seedHeadCount
	});
}

function appendBlade(mesh, blade) {
	const start = mesh.vertices.length;
	const side = direction(blade.yaw);
	const forward = direction(blade.yaw + Math.PI / 2);
	for (const level of BLADE_LEVELS) {
		const center = bladeCenter(blade, forward, level);
		pushRibbonPair(mesh, center, side, blade.width * level.width, level.height);
	}
	const tip = bladeCenter(blade, forward, { height: 1, lean: 1.08 });
	mesh.vertices.push(tip);
	mesh.uvs.push(0.5, 1);
	for (let level = 0; level < BLADE_LEVELS.length - 1; level += 1) {
		const lower = start + level * 2;
		mesh.faces.push([lower, lower + 1, lower + 3, lower + 2]);
	}
	const shoulders = start + (BLADE_LEVELS.length - 1) * 2;
	mesh.faces.push([shoulders, shoulders + 1, start + BLADE_LEVELS.length * 2]);
}

function bladeCenter(blade, forward, level) {
	return [
		blade.x + forward.x * blade.lean * level.lean,
		blade.y + blade.height * level.height,
		blade.z + forward.z * blade.lean * level.lean
	];
}

function pushRibbonPair(mesh, center, side, halfWidth, verticalRatio) {
	mesh.vertices.push(
		[center[0] - side.x * halfWidth, center[1], center[2] - side.z * halfWidth],
		[center[0] + side.x * halfWidth, center[1], center[2] + side.z * halfWidth]
	);
	mesh.uvs.push(0, verticalRatio, 1, verticalRatio);
}

function appendSeedHead(mesh, blade) {
	const topY = blade.y + blade.height;
	const start = mesh.vertices.length;
	const side = direction(blade.yaw);
	const width = blade.width * 1.55;
	mesh.vertices.push(
		[blade.x - side.x * width, topY - 0.03, blade.z - side.z * width],
		[blade.x + side.x * width, topY - 0.03, blade.z + side.z * width],
		[blade.x + side.x * width * 0.34, topY + 0.13, blade.z + side.z * width * 0.34],
		[blade.x - side.x * width * 0.34, topY + 0.13, blade.z - side.z * width * 0.34]
	);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(0, 0, 1, 0, 0.7, 1, 0.3, 1);
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
			[flower.x + Math.cos(tangent) * radius * 0.32, flower.y, flower.z + Math.sin(tangent) * radius * 0.32],
			[flower.x + Math.cos(angle) * radius, flower.y + radius * 0.18, flower.z + Math.sin(angle) * radius],
			[flower.x - Math.cos(tangent) * radius * 0.32, flower.y, flower.z - Math.sin(tangent) * radius * 0.32]
		);
		mesh.faces.push([start, start + 1, start + 2, start + 3]);
		mesh.uvs.push(0.5, 0.5, 0, 0, 0.5, 1, 1, 0);
	}
}

function direction(angle) {
	return { x: Math.cos(angle), z: Math.sin(angle) };
}
