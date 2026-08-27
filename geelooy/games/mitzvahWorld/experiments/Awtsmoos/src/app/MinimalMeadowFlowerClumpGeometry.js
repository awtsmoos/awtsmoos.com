// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerClumpGeometry.js
 * @description Bakes repeated multi-flower clump instances into two low-draw manual meshes.
 * The Awtsmoos reveals many blossoms through one measured field; Awtsmoos.com repeats stem,
 * blade, petal, center, clump seed, UV, and instance ledger without one draw call per flower.
 */

export function createMinimalMeadowFlowerCellGeometry(options = {}) {
	const clumps = Math.max(1, Number(options.clumps) || 8);
	const terrain = options.terrain;
	const center = options.center || { x: 0, y: 0, z: 0 };
	const grass = geometry();
	const petals = geometry();
	for (let index = 0; index < clumps; index += 1) {
		const angle = index * 2.399963;
		const radius = 1.2 + (index % 4) * 1.25;
		const x = Math.cos(angle) * radius;
		const z = Math.sin(angle) * radius;
		const worldY = terrain.heightAt(center.x + x, center.z + z);
		const y = worldY - center.y + 0.02;
		appendClump(grass, petals, x, y, z, index);
	}
	return {
		clumps,
		flowers: clumps * 4,
		grass,
		petals
	};
}

function appendClump(grass, petals, x, y, z, seed) {
	for (let blade = 0; blade < 7; blade += 1) {
		const angle = seed * 1.7 + blade * 0.89;
		const offset = 0.18 + (blade % 3) * 0.13;
		const bladeX = x + Math.cos(angle) * offset;
		const bladeZ = z + Math.sin(angle) * offset;
		appendCrossedQuad(grass, bladeX, y, bladeZ, 0.09, 0.42 + (blade % 4) * 0.08);
	}
	for (let flower = 0; flower < 4; flower += 1) {
		const angle = seed * 0.73 + flower * Math.PI / 2;
		const flowerX = x + Math.cos(angle) * 0.34;
		const flowerZ = z + Math.sin(angle) * 0.34;
		const height = 0.46 + (flower % 2) * 0.12;
		appendCrossedQuad(grass, flowerX, y, flowerZ, 0.055, height);
		appendPetalStar(petals, flowerX, y + height, flowerZ, 0.16);
	}
}

function appendCrossedQuad(target, x, y, z, width, height) {
	appendVerticalQuad(target, x, y, z, width, height, 0);
	appendVerticalQuad(target, x, y, z, width, height, Math.PI / 2);
}

function appendVerticalQuad(target, x, y, z, width, height, angle) {
	const sideX = Math.cos(angle) * width;
	const sideZ = Math.sin(angle) * width;
	appendFace(target, [
		[x - sideX, y, z - sideZ],
		[x + sideX, y, z + sideZ],
		[x + sideX * 0.28, y + height, z + sideZ * 0.28],
		[x - sideX * 0.28, y + height, z - sideZ * 0.28]
	]);
}

function appendPetalStar(target, x, y, z, radius) {
	for (let petal = 0; petal < 4; petal += 1) {
		const angle = petal * Math.PI / 2;
		const tangentX = Math.cos(angle + Math.PI / 2) * radius * 0.36;
		const tangentZ = Math.sin(angle + Math.PI / 2) * radius * 0.36;
		const reachX = Math.cos(angle) * radius;
		const reachZ = Math.sin(angle) * radius;
		appendFace(target, [
			[x - tangentX, y, z - tangentZ],
			[x + tangentX, y, z + tangentZ],
			[x + reachX, y + 0.03, z + reachZ],
			[x + reachX * 0.55, y + 0.07, z + reachZ * 0.55]
		]);
	}
}

function appendFace(target, points) {
	const start = target.vertices.length;
	for (const point of points) target.vertices.push(point);
	target.faces.push([start, start + 1, start + 2, start + 3]);
	target.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}

function geometry() {
	return { faces: [], uvs: [], vertices: [] };
}
