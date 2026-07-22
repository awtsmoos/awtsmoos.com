// B"H
// Boruch Hashem
// Blessed is He
/** Procedural textures use stable integer hashing and smooth interpolation. */

function fade(value) {
	return value * value * value * (value * (value * 6 - 15) + 10);
}

function hash(x, y, z, seed) {
	let value = Math.imul(x ^ seed, 374761393);
	value = Math.imul(value ^ y, 668265263);
	value = Math.imul(value ^ z, 2147483647);
	value ^= value >>> 13;
	return (value >>> 0) / 4294967295;
}

function lerp(a, b, factor) {
	return a + (b - a) * factor;
}

function sample(position, seed) {
	const base = position.map(Math.floor);
	const fraction = position.map((value, index) => fade(value - base[index]));
	const values = [];
	for (let z = 0; z <= 1; z += 1) {
		for (let y = 0; y <= 1; y += 1) {
			for (let x = 0; x <= 1; x += 1) {
				values.push(hash(base[0] + x, base[1] + y, base[2] + z, seed));
			}
		}
	}
	const x00 = lerp(values[0], values[1], fraction[0]);
	const x10 = lerp(values[2], values[3], fraction[0]);
	const x01 = lerp(values[4], values[5], fraction[0]);
	const x11 = lerp(values[6], values[7], fraction[0]);
	return lerp(
		lerp(x00, x10, fraction[1]),
		lerp(x01, x11, fraction[1]),
		fraction[2]
	);
}

export function executeNoiseTexture(inputs = {}, config = {}) {
	const vector = Array.from(inputs.vector ?? [0, 0, 0]);
	const scale = Number(inputs.scale ?? 5);
	const detail = Math.max(1, Math.min(8, Math.floor(inputs.detail ?? 2)));
	let amplitude = 1;
	let frequency = scale;
	let total = 0;
	let normalization = 0;
	for (let octave = 0; octave < detail; octave += 1) {
		total += sample(vector.map((value) => value * frequency), Number(config.seed ?? 0) + octave) * amplitude;
		normalization += amplitude;
		amplitude *= Number(inputs.roughness ?? 0.5);
		frequency *= Number(inputs.lacunarity ?? 2);
	}
	const factor = normalization ? total / normalization : 0;
	return Object.freeze({ factor, color: [factor, factor, factor, 1] });
}
