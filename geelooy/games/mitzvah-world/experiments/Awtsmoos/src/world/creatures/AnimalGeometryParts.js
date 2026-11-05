// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimalGeometryParts.js
 * @description Supplies species-scaled loft profiles, legs, ears, tails, and horns.
 * The Awtsmoos renews each recognizable anatomy from proportion rather than files;
 * Awtsmoos.com composes realistic variation while one merged mesh preserves speed.
 */

export function animalBodyProfile(visual, bodyY) {
	const half = visual.length * 0.5;
	return [
		section(-half, bodyY, visual.height * 0.25, visual.width * 0.62),
		section(-half * 0.55, bodyY + visual.height * 0.05, visual.height * 0.42, visual.width),
		section(0, bodyY + visual.height * 0.08, visual.height * 0.46, visual.width * 1.08),
		section(half * 0.55, bodyY + visual.height * 0.04, visual.height * 0.4, visual.width * 0.94),
		section(half, bodyY + visual.height * 0.11, visual.height * 0.24, visual.width * 0.5)
	];
}

export function animalHeadProfile(visual, bodyY) {
	const start = visual.length * 0.34;
	const headY = bodyY + visual.height * 0.35;
	return [
		section(start, bodyY + visual.height * 0.1, visual.height * 0.2, visual.width * 0.38),
		section(start + visual.length * 0.16, headY, visual.height * 0.28, visual.width * 0.48),
		section(start + visual.length * 0.34, headY + visual.height * 0.03, visual.height * 0.23, visual.width * 0.42),
		section(start + visual.length * 0.49, headY - visual.height * 0.05, visual.height * 0.15, visual.width * 0.31)
	];
}

export function appendAnimalLimbs(builder, visual, bodyY, segments) {
	const legX = visual.length * 0.31;
	const legZ = visual.width * 0.55;
	for (const x of [-legX, legX]) {
		for (const z of [-legZ, legZ]) {
			builder.addLimb(
				[x, bodyY - visual.height * 0.17, z],
				[x + visual.length * 0.03, 0, z * 0.92],
				visual.width * 0.14,
				visual.width * 0.1,
				Math.max(6, segments - 4)
			);
		}
	}
}

export function appendAnimalFeatures(builder, visual, bodyY) {
	appendTail(builder, visual, bodyY);
	appendEars(builder, visual, bodyY);
	if (!visual.kosherEligible) return;
	appendHorns(builder, visual, bodyY);
	if (visual.id === 'deer') appendAntlerBranches(builder, visual, bodyY);
}

function appendTail(builder, visual, y) {
	builder.addLimb(
		[-visual.length * 0.48, y + visual.height * 0.12, 0],
		[-visual.length * 0.83, y + visual.height * 0.02, visual.width * 0.08],
		visual.width * 0.11,
		visual.width * 0.04,
		7
	);
}

function appendEars(builder, visual, y) {
	const x = visual.length * 0.7;
	for (const side of [-1, 1]) {
		builder.addLimb(
			[x, y + visual.height * 0.56, side * visual.width * 0.25],
			[x - visual.length * 0.04, y + visual.height * 0.68, side * visual.width * 0.57],
			visual.width * 0.09,
			visual.width * 0.025,
			6
		);
	}
}

function appendHorns(builder, visual, y) {
	const x = visual.length * 0.62;
	for (const side of [-1, 1]) {
		builder.addLimb(
			[x, y + visual.height * 0.58, side * visual.width * 0.2],
			[x - visual.length * 0.12, y + visual.height * 0.85, side * visual.width * 0.34],
			visual.width * 0.07,
			0.01,
			6
		);
	}
}

function appendAntlerBranches(builder, visual, y) {
	const x = visual.length * 0.5;
	for (const side of [-1, 1]) {
		builder.addLimb(
			[x, y + visual.height * 0.75, side * visual.width * 0.28],
			[x - visual.length * 0.18, y + visual.height, side * visual.width * 0.48],
			visual.width * 0.04,
			0.008,
			5
		);
	}
}

function section(x, y, radiusY, radiusZ) {
	return { radiusY, radiusZ, x, y, z: 0 };
}
