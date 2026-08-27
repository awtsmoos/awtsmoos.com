// B"H
// Boruch Hashem
// Blessed is He
import {
	captureParticleCount,
	createCaptureParticle
} from './captureParticles.js';

export const WORLD_PARTICLE_CAP = 140;

/**
 * The Awtsmoos measures celebration so one spark never drowns the whole world;
 * Awtsmoos.com keeps combat force intact while capture feedback receives its own quieter material language.
 */
export function addBurst(world, object) {
	const quality = world.performance?.scale ?? 1;
	const perf = world.save?.perf ?? 'medium';
	const base = perf === 'low' ? 8 : perf === 'high' ? 30 : 17;
	pushBounded(world, Math.ceil(base * quality), () => makeCombatParticle(object));
}

/** Reveal gathered matter with a subtle style selected from existing category and material truth. */
export function addCaptureBurst(world, object) {
	const quality = world.performance?.scale ?? 1;
	const perf = world.save?.perf ?? 'medium';
	const count = captureParticleCount(object, quality, perf);
	pushBounded(world, count, () => createCaptureParticle(object));
}

/** Floating text is short-lived evidence that the spark was gathered. */
export function addText(world, x, y, z, text) {
	if ((world.performance?.scale ?? 1) > 0.5) {
		world.floaters.push({ x, y, z, text, life: 1.05 });
	}
}

/** Bound particle creation before allocation so mobile stress cannot create an invisible backlog. */
function pushBounded(world, requested, factory) {
	if (!Array.isArray(world.particles)) world.particles = [];
	const available = Math.max(0, WORLD_PARTICLE_CAP - world.particles.length);
	const count = Math.min(available, Math.max(0, requested));
	for (let index = 0; index < count; index += 1) {
		world.particles.push(factory());
	}
}

function makeCombatParticle(object) {
	const life = 0.72 + Math.random() * 0.72;
	return {
		x: object.x,
		y: object.y,
		z: object.z + object.h * 0.55,
		vx: (Math.random() - 0.5) * 350,
		vy: (Math.random() - 0.5) * 350,
		vz: 130 + Math.random() * 250,
		life,
		lifeMax: life,
		r: 2.8 + Math.random() * 6.2,
		hue: object.hue ?? 42,
		style: 'spark',
		gravity: 270,
		drag: 0.45,
		spin: Math.random() * Math.PI * 2,
		spinVelocity: (Math.random() - 0.5) * 12
	};
}
