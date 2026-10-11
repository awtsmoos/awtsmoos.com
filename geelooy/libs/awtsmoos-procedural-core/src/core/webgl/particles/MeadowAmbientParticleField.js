// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowAmbientParticleField.js
 * @description Dense real-time ambient particle field for the dream meadow.
 * The Awtsmoos renews thousands of small lights in mutable typed arrays before
 * any frame can count their cost; Awtsmoos.com drives the field with the core's
 * own deterministic turbulence sampler, thermal buoyancy, wander steering, and
 * drag, so fireflies, spores, and embers stay seed-stable at sixty frames.
 */

import { createSeededRandom, normalizeRandomSeed } from '../../proceduralObject/particles/seededRandom.js';
import { sampleParticleTurbulence } from '../../proceduralObject/particles/particleTurbulence.js';

const FULL_TURN = Math.PI * 2;

/** Named per-age color ramps consumed by pack(). */
function rampColor(kind, base, age01, out) {
	if (kind === 'ember-cool') {
		const heat = 1 - age01;
		out[0] = base[0] * (0.55 + 0.45 * heat) + 0.35 * heat * heat;
		out[1] = base[1] * (0.25 + 0.75 * heat);
		out[2] = base[2] * (0.2 + 0.5 * heat);
		return out;
	}
	out[0] = base[0];
	out[1] = base[1];
	out[2] = base[2];
	return out;
}

/**
 * Creates one mutable dense ambient particle field from an effect recipe.
 * @param {object} presetRecipe Effect recipe carrying a meadowField block.
 * @param {object} [options={}] { count, seed, windCoupling }
 * @returns {object|null} Field with update(dt, env), pack(), count; null without meadowField.
 */
export function createMeadowAmbientParticleField(presetRecipe, options = {}) {
	const spec = presetRecipe?.meadowField;
	if (!spec) return null;
	const count = Math.max(0, Math.floor(options.count ?? spec.count ?? 400));
	const seed = normalizeRandomSeed(hashSeedValue(options.seed ?? presetRecipe.seed ?? presetRecipe.id ?? 1));
	const bounds = normalizeBounds(spec.bounds);
	const colors = spec.colors?.length ? spec.colors : [[1, 1, 1]];
	const sizeRange = spec.size || [0.05, 0.12];
	const lifetimeRange = spec.lifetime || [6, 12];
	const forces = spec.forces || {};
	const windCoupling = Math.max(0, Number(options.windCoupling ?? 0.45));

	const random = createSeededRandom(seed);
	const positions = new Float32Array(count * 3);
	const velocities = new Float32Array(count * 3);
	const anchors = new Float32Array(count * 3);
	const ages = new Float32Array(count);
	const lifetimes = new Float32Array(count);
	const sizes = new Float32Array(count);
	const phases = new Float32Array(count);
	const colorSlots = new Uint8Array(count);
	const packedPositions = new Float32Array(count * 3);
	const packedColors = new Float32Array(count * 4);
	const packedSizes = new Float32Array(count);

	const field = {
		spec,
		count,
		seed,
		/** Advances the field; env = { time, wind: [x,y,z], gustScale }. */
		update(dt, env = {}) {
			const step = Math.min(0.05, Math.max(0.0005, Number(dt) || 0.016));
			const time = Number(env.time ?? 0);
			const wind = env.wind || [0, 0, 0];
			const gust = Number(env.gustScale ?? 1);
			for (let index = 0; index < count; index += 1) {
				ages[index] += step;
				if (ages[index] >= lifetimes[index]) {
					spawnParticle(index, false);
				}
				const ix3 = index * 3;
				const px = positions[ix3];
				const py = positions[ix3 + 1];
				const pz = positions[ix3 + 2];
				let vx = velocities[ix3];
				let vy = velocities[ix3 + 1];
				let vz = velocities[ix3 + 2];

				if (forces.turbulence) {
					const turb = sampleParticleTurbulence([px, py, pz], {
						frequency: forces.turbulence.frequency ?? 0.4,
						time,
						evolution: forces.turbulence.evolution ?? 0.6,
						seed: seed * 0.000123 + phases[index]
					});
					const strength = (forces.turbulence.strength ?? 0.5) * gust;
					vx += turb[0] * strength * step;
					vy += turb[1] * strength * step;
					vz += turb[2] * strength * step;
				}
				if (forces.thermal) {
					vy += (forces.thermal.strength ?? 0.2) * step;
				}
				if (forces.sink) {
					vy -= forces.sink * step;
				}
				if (forces.wander) {
					const wobble = time * (forces.wander.speed ?? 0.6) + phases[index] * FULL_TURN;
					const desiredX = anchors[ix3] + Math.cos(wobble) * (forces.wander.radius ?? 2);
					const desiredY = anchors[ix3 + 1] + Math.sin(wobble * 0.7) * (forces.wander.radius ?? 2) * 0.4;
					const desiredZ = anchors[ix3 + 2] + Math.sin(wobble * 1.3) * (forces.wander.radius ?? 2);
					const steer = (forces.wander.strength ?? 0.5) * step;
					vx += (desiredX - px) * steer;
					vy += (desiredY - py) * steer;
					vz += (desiredZ - pz) * steer;
				}
				vx += (wind[0] - vx) * windCoupling * step;
				vy += (wind[1] - vy) * windCoupling * step;
				vz += (wind[2] - vz) * windCoupling * step;
				const drag = Math.max(0, 1 - (spec.drag ?? 0.5) * step);
				vx *= drag;
				vy *= drag;
				vz *= drag;

				let nx = px + vx * step;
				let ny = py + vy * step;
				let nz = pz + vz * step;
				if (nx < bounds.min[0] || nx > bounds.max[0] ||
					ny < bounds.min[1] || ny > bounds.max[1] ||
					nz < bounds.min[2] || nz > bounds.max[2]) {
					if (spec.respawn === 'bounds' || !spec.respawn) {
						spawnParticle(index, false);
						continue;
					}
					nx = Math.min(bounds.max[0], Math.max(bounds.min[0], nx));
					ny = Math.min(bounds.max[1], Math.max(bounds.min[1], ny));
					nz = Math.min(bounds.max[2], Math.max(bounds.min[2], nz));
				}
				positions[ix3] = nx;
				positions[ix3 + 1] = ny;
				positions[ix3 + 2] = nz;
				velocities[ix3] = vx;
				velocities[ix3 + 1] = vy;
				velocities[ix3 + 2] = vz;
			}
			return field;
		},
		/**
		 * Packs live particles into render-ready typed arrays (reused buffers).
		 * Brightness folds age fade and per-particle blink phase together.
		 */
		pack(time = 0) {
			const blink = spec.blink;
			const colorByAge = spec.colorByAge;
			const rgb = [1, 1, 1];
			for (let index = 0; index < count; index += 1) {
				const ix3 = index * 3;
				const ix4 = index * 4;
				packedPositions[ix3] = positions[ix3];
				packedPositions[ix3 + 1] = positions[ix3 + 1];
				packedPositions[ix3 + 2] = positions[ix3 + 2];
				const age01 = lifetimes[index] > 0 ? Math.min(1, ages[index] / lifetimes[index]) : 1;
				const fadeIn = Math.min(1, age01 / 0.12);
				const fadeOut = Math.min(1, (1 - age01) / 0.18);
				let brightness = Math.min(fadeIn, fadeOut);
				if (blink) {
					const period = lerp(blink.period?.[0] ?? 1.6, blink.period?.[1] ?? 3.2, phases[index]);
					const duty = lerp(blink.duty?.[0] ?? 0.5, blink.duty?.[1] ?? 0.8, hash01(phases[index] * 91.7));
					const cycle = ((time / period) + phases[index] * 7.31) % 1;
					const on = cycle < duty ? 1 : 0;
					const edge = 0.12;
					const blinkShape = on
						? Math.min(1, (duty - cycle) / edge + 1)
						: Math.max(0, 1 - (cycle - duty) / edge);
					brightness *= Math.max(0, Math.min(1, blinkShape));
				}
				const base = colors[colorSlots[index] % colors.length];
				rampColor(colorByAge, base, age01, rgb);
				packedColors[ix4] = rgb[0];
				packedColors[ix4 + 1] = rgb[1];
				packedColors[ix4 + 2] = rgb[2];
				packedColors[ix4 + 3] = Math.max(0, Math.min(1, brightness));
				packedSizes[index] = sizes[index];
			}
			return { count, positions: packedPositions, colors: packedColors, sizes: packedSizes };
		},
		/** Re-seeds every particle (deterministic restart). */
		reseed() {
			for (let index = 0; index < count; index += 1) spawnParticle(index, true);
			return field;
		}
	};

	function spawnParticle(index, initial) {
		const ix3 = index * 3;
		const mode = spec.respawn || 'bounds';
		const rx = random();
		const ry = random();
		const rz = random();
		let y = bounds.min[1] + ry * (bounds.max[1] - bounds.min[1]);
		if (mode === 'bounds-bottom') {
			y = bounds.min[1] + ry * (bounds.max[1] - bounds.min[1]) * (initial ? 1 : 0.25);
		} else if (mode === 'bounds-top') {
			y = bounds.max[1] - ry * (bounds.max[1] - bounds.min[1]) * (initial ? 1 : 0.25);
		}
		positions[ix3] = bounds.min[0] + rx * (bounds.max[0] - bounds.min[0]);
		positions[ix3 + 1] = y;
		positions[ix3 + 2] = bounds.min[2] + rz * (bounds.max[2] - bounds.min[2]);
		anchors[ix3] = positions[ix3];
		anchors[ix3 + 1] = positions[ix3 + 1];
		anchors[ix3 + 2] = positions[ix3 + 2];
		velocities[ix3] = (random() - 0.5) * 0.6;
		velocities[ix3 + 1] = (random() - 0.5) * 0.3;
		velocities[ix3 + 2] = (random() - 0.5) * 0.6;
		ages[index] = initial ? random() * lifetimeRange[1] : 0;
		lifetimes[index] = lifetimeRange[0] + random() * (lifetimeRange[1] - lifetimeRange[0]);
		sizes[index] = sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]);
		phases[index] = random();
		colorSlots[index] = Math.floor(random() * colors.length);
	}

	for (let index = 0; index < count; index += 1) spawnParticle(index, true);
	return Object.freeze(field);
}

function normalizeBounds(bounds) {
	const fallback = { min: [-40, 0.4, -40], max: [40, 7, 40] };
	const source = bounds || fallback;
	return {
		min: [Number(source.min?.[0] ?? fallback.min[0]), Number(source.min?.[1] ?? fallback.min[1]), Number(source.min?.[2] ?? fallback.min[2])],
		max: [Number(source.max?.[0] ?? fallback.max[0]), Number(source.max?.[1] ?? fallback.max[1]), Number(source.max?.[2] ?? fallback.max[2])]
	};
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function hash01(value) {
	const s = Math.sin(value * 127.1) * 43758.5453;
	return s - Math.floor(s);
}

/** Hashes string seeds into finite numbers for the seeded RNG. */
function hashSeedValue(value) {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	const text = String(value ?? 'meadow-field');
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
