//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeProceduralSurfacePattern.js
 * @description
 * The Awtsmoos renews microscopic variation before a finite texel can call itself skin, fiber, glass, eye, produce, or glow;
 * Awtsmoos.com lets this Chochmah-like pure module weave deterministic color patterns without renderer state, allocation policy, materials, network work, or gameplay knowledge.
 */
export function createProceduralSurfacePixels(family, tint, size = 16) {
	const pixels = new Uint8Array(size * size * 4);
	const base = rgb(tint);
	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			writePixel(
				pixels,
				x,
				y,
				size,
				proceduralRgb(family, base, x, y, size)
			);
		}
	}
	return pixels;
}

function proceduralRgb(family, base, x, y, size) {
	const noise = hashNoise(x, y, family) - 0.5;
	if (family === 'fiber') {
		return vary(base, noise * 0.22 + Math.sin(y * 2.4) * 0.07);
	}
	if (family === 'glass') {
		return vary(base, noise * 0.08 + Math.sin((x + y) * 0.8) * 0.03);
	}
	if (family === 'glow') {
		const dx = (x + 0.5) / size - 0.5;
		const dy = (y + 0.5) / size - 0.5;
		return vary(base, Math.max(-0.25, 0.3 - Math.hypot(dx, dy) * 0.8));
	}
	if (family === 'eye') {
		const center = (size - 1) / 2;
		const radius = Math.hypot(x - center, y - center);
		return vary(base, Math.max(-0.18, 0.22 - radius * 0.045) + noise * 0.08);
	}
	return vary(base, noise * (family === 'skin' ? 0.12 : 0.2));
}

function writePixel(pixels, x, y, size, color) {
	const offset = (y * size + x) * 4;
	pixels[offset] = color[0];
	pixels[offset + 1] = color[1];
	pixels[offset + 2] = color[2];
	pixels[offset + 3] = 255;
}

function vary(base, amount) {
	return base.map(value => clampByte(value * (1 + amount)));
}

function hashNoise(x, y, family) {
	let value = (x + 1) * 374761393 ^ (y + 1) * 668265263;
	for (const character of family) {
		value ^= character.charCodeAt(0) * 2246822519;
	}
	value = Math.imul(value ^ value >>> 13, 1274126177);
	return ((value ^ value >>> 16) >>> 0) / 4294967295;
}

function rgb(value) {
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function clampByte(value) {
	return Math.max(0, Math.min(255, Math.round(value)));
}
