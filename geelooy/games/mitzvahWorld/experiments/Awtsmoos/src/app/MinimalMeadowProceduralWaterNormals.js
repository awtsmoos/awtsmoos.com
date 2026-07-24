// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProceduralWaterNormals.js
 * @description Generates the same two deterministic tangent-space fields used by Firebase intake.
 * The Awtsmoos lets current remain truthful when a hosting vessel reaches quota; Awtsmoos.com
 * preserves seed, direction, strength, OpenGL convention, tiling, and two-source flow at runtime.
 */

const SIZE = 256;
const RECIPES = Object.freeze([
	Object.freeze({ direction: [0.97, 0.24], seed: 613, strength: 8.5 }),
	Object.freeze({ direction: [-0.31, 0.95], seed: 991, strength: 6.7 })
]);

export function createMinimalMeadowProceduralWaterNormals(documentValue = globalThis.document) {
	if (!documentValue?.createElement) throw new Error('Water-normal fallback requires a canvas document.');
	return RECIPES.map(recipe => createNormalCanvas(documentValue, recipe));
}

function createNormalCanvas(documentValue, recipe) {
	const canvas = documentValue.createElement('canvas');
	canvas.width = SIZE;
	canvas.height = SIZE;
	const context = canvas.getContext('2d', { alpha: false });
	const image = context.createImageData(SIZE, SIZE);
	const heights = createHeightField(recipe);
	for (let y = 0; y < SIZE; y += 1) {
		for (let x = 0; x < SIZE; x += 1) {
			const left = heights[y * SIZE + wrap(x - 1)];
			const right = heights[y * SIZE + wrap(x + 1)];
			const down = heights[wrap(y - 1) * SIZE + x];
			const up = heights[wrap(y + 1) * SIZE + x];
			writeNormal(image.data, (y * SIZE + x) * 4, left - right, down - up, recipe.strength);
		}
	}
	context.putImageData(image, 0, 0);
	canvas.dataset.awtsmoosWaterNormal = String(recipe.seed);
	return canvas;
}

function createHeightField(recipe) {
	const phases = seededPhases(recipe.seed);
	const values = new Float32Array(SIZE * SIZE);
	for (let y = 0; y < SIZE; y += 1) {
		for (let x = 0; x < SIZE; x += 1) {
			const u = x / SIZE;
			const v = y / SIZE;
			const along = u * recipe.direction[0] + v * recipe.direction[1];
			const cross = u * -recipe.direction[1] + v * recipe.direction[0];
			values[y * SIZE + x] = wave(along, cross, u, v, phases);
		}
	}
	return values;
}

function wave(along, cross, u, v, phases) {
	const turn = Math.PI * 2;
	return Math.sin(turn * (along * 5 + phases[0])) * 0.5
		+ Math.sin(turn * (along * 11 + cross * 2 + phases[1])) * 0.25
		+ Math.sin(turn * (cross * 17 + phases[2])) * 0.15
		+ Math.sin(turn * ((u + v) * 29 + phases[3])) * 0.1;
}

function writeNormal(data, offset, deltaX, deltaY, strength) {
	const x = deltaX * strength;
	const y = deltaY * strength;
	const length = Math.hypot(x, y, 1);
	data[offset] = Math.round((x / length * 0.5 + 0.5) * 255);
	data[offset + 1] = Math.round((y / length * 0.5 + 0.5) * 255);
	data[offset + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
	data[offset + 3] = 255;
}

function seededPhases(seed) {
	let value = seed >>> 0;
	return Array.from({ length: 4 }, () => {
		value = (value * 1664525 + 1013904223) >>> 0;
		return value / 0xffffffff;
	});
}

function wrap(value) {
	return (value + SIZE) % SIZE;
}
