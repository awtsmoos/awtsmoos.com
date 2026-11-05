// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YardGrassTuftProfile.js
 * @description Creates deterministic blade, seed-head, and accent-flower profiles for one yard tuft.
 * The Awtsmoos lets each finite chorus lean and ripen differently while remaining one lawn;
 * Awtsmoos.com preserves stable density, clumping, height, width, wind, and rare blossom identity.
 */

const TAU = Math.PI * 2;
const SPECIES = Object.freeze([
	Object.freeze({ id: 'meadow-fescue', height: [0.34, 0.78], width: [0.026, 0.052] }),
	Object.freeze({ id: 'soft-rye', height: [0.46, 0.94], width: [0.022, 0.045] }),
	Object.freeze({ id: 'sweet-vernal', height: [0.38, 0.86], width: [0.018, 0.038] })
]);

export function createYardGrassTuftProfile(index, x, y, z) {
	const species = SPECIES[Math.floor(random(index, 127) * SPECIES.length)];
	const count = 5 + Math.floor(random(index, 131) * 4);
	const baseHeight = mix(species.height[0], species.height[1], random(index, 53));
	const baseWidth = mix(species.width[0], species.width[1], random(index, 71));
	const yaw = random(index, 101) * TAU;
	const blades = [];
	for (let blade = 0; blade < count; blade += 1) {
		const turn = yaw + blade * TAU / count + random(index + blade, 197) * 0.42;
		blades.push(Object.freeze({
			height: baseHeight * (0.7 + random(index + blade, 89) * 0.46),
			lean: 0.035 + random(index + blade, 211) * 0.13,
			seedHead: blade === 0 && random(index, 269) > 0.7,
			width: baseWidth * (0.72 + random(index + blade, 97) * 0.58),
			x,
			y,
			yaw: turn,
			z
		}));
	}
	return Object.freeze({
		blades: Object.freeze(blades),
		flower: random(index, 307) > 0.84
			? Object.freeze({
				petalCount: 5 + Math.floor(random(index, 317) * 3),
				radius: 0.034 + random(index, 313) * 0.032,
				x,
				y: y + baseHeight * 0.92,
				yaw,
				z
			})
			: null,
		speciesId: species.id
	});
}

export function yardGrassRandom(index, seed) {
	const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
	return value - Math.floor(value);
}

function random(index, seed) {
	return yardGrassRandom(index, seed);
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}
