// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapProceduralTerrainTextures.js
 * @description Grows honest tileable ground and building textures from a fixed seed, with no
 * network, no AI imagery, and no Math.random. Blade-level grass mottling, clumpy dirt with
 * pebbles, cracked lichen stone, wood grain, plaster, brick courses, roof tile, and glass are
 * all painted into 256px RGBA fields by deterministic multi-octave value noise whose lattice
 * wraps at every octave, so every texture tiles seamlessly. Generation runs once at boot and
 * the set is cached; the bootstrap meadow binds grass/stone into its ground materials while
 * house and player-building descriptors reference the same kinds by name.
 * The Awtsmoos clothes the earth before any distant image can delay the road; Awtsmoos.com
 * keeps every pixel reproducible from one small seed.
 */

export const PROCEDURAL_TEXTURE_SEED = 613;
export const PROCEDURAL_TEXTURE_SIZE = 256;

export const PROCEDURAL_TEXTURE_KINDS = Object.freeze([
	'grass',
	'dirt',
	'stone',
	'wood',
	'plaster',
	'brick',
	'roofTile',
	'glass'
]);

/** Deterministic PRNG: mulberry32. No Math.random anywhere in this module. */
function mulberry32(seed) {
	let state = seed >>> 0;
	return function next() {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Builds a tileable multi-octave value-noise field over [0, size) x [0, size).
 * Every octave's lattice wraps modulo its cell count, so field(0, y) === field(size, y)
 * and field(x, 0) === field(x, size): the painted texture tiles seamlessly.
 * Octaves stop once the lattice outresolves the texels, so high-frequency fields
 * never pay for detail finer than one pixel.
 * @param {number} seed Deterministic seed.
 * @param {number} size Field extent in texels (square).
 * @param {number} baseCells Lattice cells at the first octave.
 * @param {number} [maxOctaves=3] Octave budget.
 * @returns {(x:number, y:number) => number} Field value in [0, 1].
 */
export function createTileableNoiseField(seed, size, baseCells, maxOctaves = 3) {
	const layers = [];
	const rand = mulberry32((seed ^ 0x9e3779b9) >>> 0);
	let cells = Math.max(1, Math.floor(baseCells));
	let amplitude = 1;
	let total = 0;
	for (let o = 0; o < maxOctaves && cells <= size; o += 1) {
		const lattice = new Float32Array(cells * cells);
		for (let i = 0; i < lattice.length; i += 1) lattice[i] = rand();
		layers.push({ cells, lattice, amplitude });
		total += amplitude;
		amplitude *= 0.5;
		cells *= 2;
	}
	return function field(x, y) {
		let sum = 0;
		for (const layer of layers) {
			sum += octaveValue(layer, x, y, size) * layer.amplitude;
		}
		return sum / total;
	};
}

function octaveValue(layer, x, y, size) {
	const { cells, lattice } = layer;
	const gx = (x / size) * cells;
	const gy = (y / size) * cells;
	const ix = Math.floor(gx);
	const iy = Math.floor(gy);
	const x0 = ((ix % cells) + cells) % cells;
	const y0 = ((iy % cells) + cells) % cells;
	const x1 = (x0 + 1) % cells;
	const y1 = (y0 + 1) % cells;
	let fx = gx - ix;
	let fy = gy - iy;
	fx = fx * fx * (3 - 2 * fx);
	fy = fy * fy * (3 - 2 * fy);
	const v00 = lattice[y0 * cells + x0];
	const v10 = lattice[y0 * cells + x1];
	const v01 = lattice[y1 * cells + x0];
	const v11 = lattice[y1 * cells + x1];
	return (v00 * (1 - fx) + v10 * fx) * (1 - fy)
		+ (v01 * (1 - fx) + v11 * fx) * fy;
}

function clampByte(value) {
	return value < 0 ? 0 : value > 255 ? 255 : Math.round(value);
}

function paint(size, painter) {
	const data = new Uint8ClampedArray(size * size * 4);
	painter(data, size);
	return data;
}

function setPixel(data, size, x, y, r, g, b, a = 255) {
	const i = (y * size + x) * 4;
	data[i] = clampByte(r);
	data[i + 1] = clampByte(g);
	data[i + 2] = clampByte(b);
	data[i + 3] = clampByte(a);
}

function mix3(a, b, t) {
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const PAINTERS = {
	/** Meadow grass: blade-level mottling, hue drift, bare-earth flecks. */
	grass(data, size, seed) {
		const patches = createTileableNoiseField(seed + 11, size, 4);
		const mottle = createTileableNoiseField(seed + 23, size, 16);
		const blades = createTileableNoiseField(seed + 37, size, 64);
		const base = [36, 112, 46];
		const yellowGreen = [86, 138, 52];
		const blueGreen = [30, 100, 78];
		const bladeDark = [22, 72, 30];
		const bladeLight = [128, 176, 92];
		const bareDirt = [122, 94, 64];
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const patch = patches(x, y);
				let rgb = mix3(base, patch > 0.55 ? yellowGreen : blueGreen, Math.abs(patch - 0.5) * 1.4);
				const mot = mottle(x, y);
				const shade = 0.86 + mot * 0.28;
				rgb = [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
				const blade = blades(x, y);
				if (blade > 0.78) rgb = mix3(rgb, bladeLight, 0.55);
				else if (blade < 0.22) rgb = mix3(rgb, bladeDark, 0.6);
				if (mot > 0.93 && blade < 0.4) rgb = mix3(rgb, bareDirt, 0.5);
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
	},
	/** Dirt: clumpy brown earth with scattered pebbles. */
	dirt(data, size, seed) {
		const clumps = createTileableNoiseField(seed + 41, size, 8);
		const fine = createTileableNoiseField(seed + 53, size, 32);
		const base = [122, 90, 62];
		const dark = [88, 62, 42];
		const light = [154, 122, 92];
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const clump = clumps(x, y);
				let rgb = mix3(base, clump > 0.5 ? light : dark, Math.abs(clump - 0.5) * 1.1);
				const shade = 0.9 + fine(x, y) * 0.2;
				rgb = [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
		scatterPebbles(data, size, mulberry32((seed + 67) >>> 0), 150);
	},
	/** Stone: grey rock with dark cracks and pale lichen colonies. */
	stone(data, size, seed) {
		const tone = createTileableNoiseField(seed + 71, size, 4);
		const grain = createTileableNoiseField(seed + 83, size, 16);
		const lichenMask = createTileableNoiseField(seed + 103, size, 5);
		const base = [140, 136, 130];
		const dark = [104, 100, 95];
		const light = [168, 164, 156];
		const crackColor = [58, 56, 53];
		const lichen = [168, 178, 140];
		const lichenRust = [188, 128, 80];
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const t = tone(x, y);
				let rgb = mix3(base, t > 0.5 ? light : dark, Math.abs(t - 0.5) * 1.2);
				const g = grain(x, y);
				const shade = 0.92 + g * 0.16;
				rgb = [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
				if (1 - Math.abs(2 * g - 1) > 0.93) rgb = mix3(rgb, crackColor, 0.85);
				const lm = lichenMask(x, y);
				if (lm > 0.72) rgb = mix3(rgb, lichen, (lm - 0.72) * 2.4);
				else if (lm < 0.2) rgb = mix3(rgb, lichenRust, (0.2 - lm) * 2.0);
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
	},
	/** Wood: vertical grain with warped growth lines and knots. */
	wood(data, size, seed) {
		const warp = createTileableNoiseField(seed + 109, size, 6);
		const fine = createTileableNoiseField(seed + 127, size, 48, 2);
		const base = [138, 90, 51];
		const streak = [96, 58, 32];
		const light = [168, 118, 74];
		const rand = mulberry32((seed + 131) >>> 0);
		const knots = [];
		for (let i = 0; i < 5; i += 1) {
			knots.push({ x: rand() * size, y: rand() * size, r: 5 + rand() * 7 });
		}
		const knotMask = new Float32Array(size * size);
		for (const knot of knots) {
			const r = Math.ceil(knot.r);
			for (let oy = -r; oy <= r; oy += 1) {
				for (let ox = -r; ox <= r; ox += 1) {
					const d = Math.sqrt(ox * ox + oy * oy);
					if (d >= knot.r) continue;
					const x = (((Math.round(knot.x + ox)) % size) + size) % size;
					const y = (((Math.round(knot.y + oy)) % size) + size) % size;
					const t = 1 - d / knot.r;
					const idx = y * size + x;
					if (t > knotMask[idx]) knotMask[idx] = t;
				}
			}
		}
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const w = warp(x, y);
				const line = 0.5 + 0.5 * Math.sin(x * 0.55 + w * 14 + Math.sin(y * 0.05) * 2);
				let rgb = mix3(base, line > 0.62 ? streak : light, Math.abs(line - 0.5) * 1.15);
				const shade = 0.92 + fine(x, y) * 0.16;
				rgb = [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
				const knot = knotMask[y * size + x];
				if (knot > 0) rgb = mix3(rgb, [74, 46, 26], knot * 0.8);
				if (x % 32 === 0) rgb = mix3(rgb, streak, 0.35);
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
	},
	/** Plaster: warm lime plaster with soft mottling and faint stains. */
	plaster(data, size, seed) {
		const mottle = createTileableNoiseField(seed + 137, size, 8);
		const fine = createTileableNoiseField(seed + 149, size, 40);
		const stain = createTileableNoiseField(seed + 151, size, 3);
		const base = [213, 183, 151];
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const shade = 0.94 + mottle(x, y) * 0.1 + (fine(x, y) - 0.5) * 0.08;
				let rgb = [base[0] * shade, base[1] * shade, base[2] * shade];
				if (stain(x, y) > 0.8) rgb = mix3(rgb, [188, 158, 128], 0.35);
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
	},
	/** Brick: offset courses with per-brick color jitter and mortar joints. */
	brick(data, size, seed) {
		const jitter = createTileableNoiseField(seed + 157, size, 12);
		const fine = createTileableNoiseField(seed + 163, size, 48);
		const mortar = [196, 186, 172];
		const brickBase = [154, 74, 56];
		const brickDark = [122, 56, 44];
		const courseH = 32;
		const brickW = 64;
		const joint = 4;
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const row = Math.floor(y / courseH);
				const offset = (row % 2) * (brickW / 2);
				const bx = (((x + offset) % size) + size) % size;
				const inJointY = (y % courseH) < joint;
				const inJointX = (bx % brickW) < joint;
				let rgb;
				if (inJointY || inJointX) {
					rgb = [...mortar];
				} else {
					const j = jitter(bx, y);
					rgb = mix3(brickBase, brickDark, Math.abs(j - 0.5) * 1.3);
				}
				const shade = 0.93 + fine(x, y) * 0.14;
				setPixel(data, size, x, y, rgb[0] * shade, rgb[1] * shade, rgb[2] * shade);
			}
		}
	},
	/** RoofTile: rows of curved clay tiles with per-tile shading. */
	roofTile(data, size, seed) {
		const jitter = createTileableNoiseField(seed + 167, size, 16);
		const base = [116, 58, 50];
		const dark = [84, 40, 36];
		const light = [150, 84, 70];
		const tileW = 32;
		const rowH = 42;
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const tx = (x % tileW) / tileW;
				const arc = Math.sin(tx * Math.PI);
				const row = Math.floor(y / rowH);
				const rowShade = (row % 2 === 0) ? 1.0 : 0.94;
				let rgb = mix3(dark, light, arc);
				const shade = (0.9 + jitter(x, y) * 0.2) * rowShade;
				const lap = (y % rowH) < 5 ? 0.82 : 1.0;
				setPixel(data, size, x, y, rgb[0] * shade * lap, rgb[1] * shade * lap, rgb[2] * shade * lap);
			}
		}
	},
	/** Glass: pale blue with a diagonal sheen band. */
	glass(data, size, seed) {
		const fine = createTileableNoiseField(seed + 173, size, 24);
		const base = [190, 227, 234];
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const band = Math.exp(-Math.pow(((x + y) / size - 0.55) * 4.2, 2));
				let rgb = mix3(base, [235, 248, 250], band * 0.7);
				const shade = 0.96 + fine(x, y) * 0.08;
				setPixel(data, size, x, y, rgb[0] * shade, rgb[1] * shade, rgb[2] * shade, 255);
			}
		}
	}
};

/** Scatters pebbles with wrap-around so the dirt tiles seamlessly. */
function scatterPebbles(data, size, rand, count) {
	const pebbleLight = [172, 152, 132];
	const pebbleDark = [70, 52, 40];
	for (let i = 0; i < count; i += 1) {
		const cx = rand() * size;
		const cy = rand() * size;
		const r = 1 + rand() * 2.4;
		const shade = 0.85 + rand() * 0.3;
		for (let oy = -Math.ceil(r); oy <= Math.ceil(r); oy += 1) {
			for (let ox = -Math.ceil(r); ox <= Math.ceil(r); ox += 1) {
				const d = Math.sqrt(ox * ox + oy * oy);
				if (d > r) continue;
				const x = (((Math.round(cx + ox)) % size) + size) % size;
				const y = (((Math.round(cy + oy)) % size) + size) % size;
				const edge = d / r;
				const rgb = edge > 0.7
					? mix3(pebbleLight, pebbleDark, 0.55)
					: pebbleLight.map(v => v * shade);
				setPixel(data, size, x, y, rgb[0], rgb[1], rgb[2]);
			}
		}
	}
}

/**
 * Generates one deterministic procedural texture.
 * @param {string} kind One of PROCEDURAL_TEXTURE_KINDS.
 * @param {number} [seed=PROCEDURAL_TEXTURE_SEED] Fixed seed; same seed always yields identical bytes.
 * @returns {{kind:string,width:number,height:number,data:Uint8ClampedArray}} RGBA texture field.
 */
export function generateProceduralTexture(kind, seed = PROCEDURAL_TEXTURE_SEED) {
	const painter = PAINTERS[kind];
	if (!painter) throw new Error(`B"H | Unknown procedural texture kind: ${kind}`);
	const size = PROCEDURAL_TEXTURE_SIZE;
	return {
		data: paint(size, (data, s) => painter(data, s, seed >>> 0)),
		height: size,
		kind,
		width: size
	};
}

let cachedSet = null;
let cachedSeed = null;
const cachedKinds = new Map();

/**
 * Generates (once per kind) and caches a single texture. Boot paths that need only
 * grass and stone call this instead of the full set to stay inside the frame budget.
 * @param {string} kind One of PROCEDURAL_TEXTURE_KINDS.
 * @param {number} [seed=PROCEDURAL_TEXTURE_SEED] Fixed seed.
 */
export function getProceduralTexture(kind, seed = PROCEDURAL_TEXTURE_SEED) {
	const key = `${kind}:${seed >>> 0}`;
	let texture = cachedKinds.get(key);
	if (!texture) {
		texture = generateProceduralTexture(kind, seed);
		cachedKinds.set(key, texture);
	}
	return texture;
}

/**
 * Generates (once) and caches the full texture set for a seed.
 * @param {number} [seed=PROCEDURAL_TEXTURE_SEED] Fixed seed.
 * @returns {Readonly<Record<string,{kind:string,width:number,height:number,data:Uint8ClampedArray}>>}
 */
export function getProceduralTextureSet(seed = PROCEDURAL_TEXTURE_SEED) {
	if (cachedSet && cachedSeed === (seed >>> 0)) return cachedSet;
	const set = {};
	for (const kind of PROCEDURAL_TEXTURE_KINDS) {
		set[kind] = getProceduralTexture(kind, seed);
	}
	cachedSet = Object.freeze(set);
	cachedSeed = seed >>> 0;
	return cachedSet;
}

/** Drops the cached set (tests and seed changes). */
export function clearProceduralTextureCache() {
	cachedSet = null;
	cachedSeed = null;
	cachedKinds.clear();
}

/**
 * Paints a generated texture into a canvas for GL upload. Browser only; returns null in node.
 * @param {{width:number,height:number,data:Uint8ClampedArray}} texture Generated texture.
 * @returns {HTMLCanvasElement|null}
 */
export function proceduralTextureToCanvas(texture) {
	if (typeof document === 'undefined' || !texture) return null;
	const canvas = document.createElement('canvas');
	canvas.width = texture.width;
	canvas.height = texture.height;
	const context = canvas.getContext('2d');
	if (!context) return null;
	const imageData = context.createImageData(texture.width, texture.height);
	imageData.data.set(texture.data);
	context.putImageData(imageData, 0, 0);
	return canvas;
}
