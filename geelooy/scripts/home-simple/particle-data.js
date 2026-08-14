// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos arranges dust, stars, and letters into stable fields, each point carrying depth, color, speed, and hidden song.

import { SeededRandom } from "./particle-seed.js";

export const POINT_ATTRIBUTES = [
	{ name: "a_position", size: 3, offset: 0 },
	{ name: "a_size", size: 1, offset: 3 },
	{ name: "a_seed", size: 1, offset: 4 },
	{ name: "a_hue", size: 1, offset: 5 },
	{ name: "a_speed", size: 1, offset: 6 },
	{ name: "a_alpha", size: 1, offset: 7 }
];

export const GLYPH_ATTRIBUTES = [
	{ name: "a_position", size: 3, offset: 0 },
	{ name: "a_glyph", size: 1, offset: 3 },
	{ name: "a_scale", size: 1, offset: 4 },
	{ name: "a_seed", size: 1, offset: 5 },
	{ name: "a_speed", size: 1, offset: 6 },
	{ name: "a_alpha", size: 1, offset: 7 }
];

export function createPointData(amount, kind, seed) {
	const random = new SeededRandom(seed);
	const values = new Float32Array(amount * 8);

	for (let index = 0; index < amount; index += 1) {
		const offset = index * 8;
		const depth = random.next();
		const isDust = kind === "dust";
		const rareSpark = random.next() > .94;
		values[offset] = random.range(-1.12, 1.12);
		values[offset + 1] = random.range(-1.08, 1.08);
		values[offset + 2] = depth;
		values[offset + 3] = resolvePointSize(random, isDust, rareSpark);
		values[offset + 4] = random.next();
		values[offset + 5] = random.next();
		values[offset + 6] = random.range(isDust ? .28 : .48, isDust ? .72 : 1.2);
		values[offset + 7] = random.range(isDust ? .1 : .34, isDust ? .38 : .88);
	}

	return values;
}

export function createGlyphData(amount, seed) {
	const random = new SeededRandom(seed);
	const values = new Float32Array(amount * 8);

	for (let index = 0; index < amount; index += 1) {
		const offset = index * 8;
		const progress = (index + .5) / amount;
		const angle = progress * Math.PI * 6 + (index % 3) * 2.09;
		const radius = .18 + progress * .72;
		const drift = random.signed() * .075;
		values[offset] = Math.cos(angle) * radius * .86 + drift;
		values[offset + 1] = Math.sin(angle) * radius * .52 + drift;
		values[offset + 2] = random.range(.34, .96);
		values[offset + 3] = index % 22;
		values[offset + 4] = random.range(10, 17);
		values[offset + 5] = random.next();
		values[offset + 6] = random.range(.35, .74);
		values[offset + 7] = random.range(.12, .28);
	}

	return values;
}

function resolvePointSize(random, isDust, rareSpark) {
	if (isDust) {
		return random.range(.45, 1.18);
	}

	if (rareSpark) {
		return random.range(3.2, 5.4);
	}

	return random.range(1.1, 2.8);
}
