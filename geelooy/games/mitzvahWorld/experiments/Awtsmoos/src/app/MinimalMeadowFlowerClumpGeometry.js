// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerClumpGeometry.js
 * @description Bakes species-aware grass and blossoms into the same two low-draw manual meshes.
 * The Awtsmoos reveals many petal counts, heights, bends, and crowns through one measured field;
 * Awtsmoos.com preserves deterministic clumps, terrain contact, UVs, and bounded triangles.
 */

import {
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';

export function createMinimalMeadowFlowerCellGeometry(options = {}) {
	const clumps = Math.max(1, Number(options.clumps) || 8);
	const terrain = options.terrain;
	const center = options.center || { x: 0, y: 0, z: 0 };
	const species = options.species || fallbackSpecies();
	const seed = Number(options.seed) || 0;
	const grass = geometry();
	const petals = geometry();
	let flowers = 0;
	for (let index = 0; index < clumps; index += 1) {
		const angle = index * 2.399963 + unit(seed, index, 17) * 0.72;
		const radius = 0.9 + (index % 4) * 1.18 + unit(seed, index, 19) * 0.48;
		const x = Math.cos(angle) * radius;
		const z = Math.sin(angle) * radius;
		const worldY = terrain.heightAt(center.x + x, center.z + z);
		const y = worldY - center.y + 0.02;
		flowers += appendClump(grass, petals, x, y, z, index, seed, species);
	}
	return {
		clumps,
		flowers,
		grass,
		petals,
		petalCount: species.petalCount,
		speciesId: species.id
	};
}

function appendClump(grass, petals, x, y, z, index, seed, species) {
	const bladeCount = 8 + Math.floor(unit(seed, index, 23) * 6);
	for (let blade = 0; blade < bladeCount; blade += 1) {
		const angle = index * 1.7 + blade * 0.73 + unit(seed, blade, index) * 0.42;
		const offset = 0.14 + unit(seed, index * 31 + blade, 29) * 0.48;
		const height = 0.34 + unit(seed, blade, index + 37) * 0.42;
		appendCrossedBlade(grass, x + Math.cos(angle) * offset, y,
			z + Math.sin(angle) * offset, 0.055 + height * 0.045, height, angle);
	}
	const flowerCount = 2 + Math.floor(unit(seed, index, 41) * 4);
	for (let flower = 0; flower < flowerCount; flower += 1) {
		const angle = index * 0.73 + flower * 2.399963 + unit(seed, flower, index + 43) * 0.5;
		const radius = 0.2 + unit(seed, index * 17 + flower, 47) * 0.34;
		const flowerX = x + Math.cos(angle) * radius;
		const flowerZ = z + Math.sin(angle) * radius;
		const height = species.height * (0.82 + unit(seed, flower, index + 53) * 0.42);
		appendCrossedBlade(grass, flowerX, y, flowerZ, species.stemWidth, height, angle);
		appendPetalCrown(petals, flowerX, y + height, flowerZ, species, angle);
	}
	return flowerCount;
}

function appendCrossedBlade(target, x, y, z, width, height, angle) {
	appendVerticalQuad(target, x, y, z, width, height, angle);
	appendVerticalQuad(target, x, y, z, width * 0.86, height * 0.94, angle + Math.PI / 2);
}

function appendVerticalQuad(target, x, y, z, width, height, angle) {
	const sideX = Math.cos(angle) * width;
	const sideZ = Math.sin(angle) * width;
	appendFace(target, [
		[x - sideX, y, z - sideZ],
		[x + sideX, y, z + sideZ],
		[x + sideX * 0.24, y + height, z + sideZ * 0.24],
		[x - sideX * 0.24, y + height, z - sideZ * 0.24]
	]);
}

function appendPetalCrown(target, x, y, z, species, rotation) {
	for (let petal = 0; petal < species.petalCount; petal += 1) {
		const angle = rotation + petal * Math.PI * 2 / species.petalCount;
		const radius = species.petalRadius;
		const tangentX = Math.cos(angle + Math.PI / 2) * radius * 0.34;
		const tangentZ = Math.sin(angle + Math.PI / 2) * radius * 0.34;
		const reachX = Math.cos(angle) * radius;
		const reachZ = Math.sin(angle) * radius;
		appendFace(target, [
			[x - tangentX, y, z - tangentZ],
			[x + tangentX, y, z + tangentZ],
			[x + reachX, y + radius * 0.18, z + reachZ],
			[x + reachX * 0.48, y + radius * 0.42, z + reachZ * 0.48]
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

function unit(seed, index, salt) {
	return minimalMeadowSeededUnit(seed || 178, index, salt);
}

function fallbackSpecies() {
	return { height: 0.24, id: 'meadow-daisy', petalCount: 8, petalRadius: 0.045, stemWidth: 0.016 };
}
