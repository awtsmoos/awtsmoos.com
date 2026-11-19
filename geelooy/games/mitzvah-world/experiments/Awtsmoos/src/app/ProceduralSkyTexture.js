// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralSkyTexture.js
 * @description Paints one small day-sky image — blue gradient, soft sun
 * glow, drifting-look clouds — as raw RGBA pixels the tiny renderer can
 * upload without a canvas or a network image.
 * The Awtsmoos hangs a real sky inside the rich renderer, whose Core sky
 * mesh ships white: its gradient lives in a procedural shader the tiny
 * renderer never runs, so the mesh renders as a blank white dome. A
 * generated texture through the renderer's own map path restores the sky
 * the bootstrap dome already paints, with no renderer or Core change.
 * Pure pixels, no DOM: the image builds the same way in tests and in play.
 */

const WIDTH = 512;
const HEIGHT = 256;
const ZENITH = [51, 112, 204];
const HORIZON = [189, 217, 237];
const CLOUD = [252, 251, 247];
const SUN = { x: 317, y: 74, radius: 95, strength: 38 };

let cachedImage = null;

/** Returns the one shared day-sky image (512x256 raw RGBA). */
export function createProceduralSkyImage() {
	if (cachedImage) return cachedImage;
	const data = new Uint8Array(WIDTH * HEIGHT * 4);
	const blobs = cloudBlobs();
	for (let y = 0; y < HEIGHT; y += 1) {
		const up = 1 - y / (HEIGHT - 1);
		const gradient = Math.pow(up, 0.58);
		const base = [
			Math.round(HORIZON[0] + (ZENITH[0] - HORIZON[0]) * gradient),
			Math.round(HORIZON[1] + (ZENITH[1] - HORIZON[1]) * gradient),
			Math.round(HORIZON[2] + (ZENITH[2] - HORIZON[2]) * gradient)
		];
		for (let x = 0; x < WIDTH; x += 1) {
			let red = base[0];
			let green = base[1];
			let blue = base[2];
			const sunDistance = Math.hypot(x - SUN.x, y - SUN.y) / SUN.radius;
			if (sunDistance < 1) {
				const glow = (1 - sunDistance * sunDistance) * SUN.strength;
				red = Math.min(255, red + glow);
				green = Math.min(255, green + glow * 0.96);
				blue = Math.min(255, blue + glow * 0.88);
			}
			const cover = cloudCover(x, y, blobs);
			if (cover > 0) {
				red = Math.round(red + (CLOUD[0] - red) * cover);
				green = Math.round(green + (CLOUD[1] - green) * cover);
				blue = Math.round(blue + (CLOUD[2] - blue) * cover);
			}
			const at = (y * WIDTH + x) * 4;
			data[at] = red;
			data[at + 1] = green;
			data[at + 2] = blue;
			data[at + 3] = 255;
		}
	}
	cachedImage = Object.freeze({ data, height: HEIGHT, width: WIDTH });
	return cachedImage;
}

/** Soft white cloud cover at one pixel, 0..0.85, from deterministic blobs. */
function cloudCover(x, y, blobs) {
	let cover = 0;
	for (const blob of blobs) {
		const dx = (x - blob.x) / blob.rx;
		const dy = (y - blob.y) / blob.ry;
		const distance = dx * dx + dy * dy;
		if (distance >= 1) continue;
		const edge = smoothstep(1, 0.35, distance);
		const band = smoothstep(0, 14, y) * (1 - smoothstep(196, 252, y));
		cover = Math.max(cover, blob.peak * edge * band);
	}
	return Math.min(1, cover);
}

/** Fourteen deterministic cloud blobs across the upper-middle sky. */
function cloudBlobs() {
	const random = mulberry32(20261119);
	const blobs = [];
	for (let index = 0; index < 14; index += 1) {
		blobs.push({
			peak: 0.7 + random() * 0.3,
			rx: 26 + random() * 46,
			ry: 9 + random() * 11,
			x: 20 + random() * (WIDTH - 40),
			y: 36 + random() * 132
		});
	}
	return blobs;
}

function smoothstep(edge0, edge1, value) {
	const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

function mulberry32(seed) {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6D2B79F5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
