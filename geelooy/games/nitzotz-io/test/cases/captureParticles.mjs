// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	captureParticleCount,
	captureParticleStyle,
	createCaptureParticle
} from '../../js/state/captureParticles.js';
import {
	addCaptureBurst,
	WORLD_PARTICLE_CAP
} from '../../js/state/particles.js';

/**
 * The Awtsmoos proves particle motion follows actual material truth while abundance stays bounded;
 * Awtsmoos.com tests leaves, dust, motes, sparks, adaptive count, finite physics, and the hard mobile ceiling.
 */
export function runCaptureParticleCases() {
	assert.equal(captureParticleStyle(object('botanical', 'foliage')), 'leaf');
	assert.equal(captureParticleStyle(object('nature', 'treeOak')), 'leaf');
	assert.equal(captureParticleStyle(object('small', 'stone')), 'dust');
	assert.equal(captureParticleStyle(object('small', 'parchment')), 'mote');
	assert.equal(captureParticleStyle(object('small', 'none')), 'mote');
	assert.equal(captureParticleStyle(object('vehicle', 'metal')), 'mote');
	assert.equal(captureParticleStyle({ ...object('pickup', 'none'), power: 'magnet' }), 'spark');
	assert.ok(captureParticleCount({ mass: 120 }, 1, 'high') > captureParticleCount({ mass: 8 }, 0.5, 'low'));
	const particle = createCaptureParticle(object('nature', 'foliage'), () => 0.5);
	assert.equal(particle.style, 'leaf');
	assert.equal(particle.life, particle.lifeMax);
	assertFinitePhysics(particle);
	const world = cappedWorld();
	addCaptureBurst(world, object('botanical', 'foliage'));
	assert.equal(world.particles.length, WORLD_PARTICLE_CAP);
	return [
		'capture particle styles follow real world material and category truth',
		'capture particle counts scale with mass quality and performance',
		'capture particles remain finite and obey the hard world cap'
	];
}

function assertFinitePhysics(particle) {
	for (const key of ['x', 'y', 'z', 'vx', 'vy', 'vz', 'life', 'r', 'gravity', 'drag']) {
		assert.ok(Number.isFinite(particle[key]), `particle ${key} must be finite`);
	}
}

function object(category, material) {
	return {
		x: 10,
		y: 20,
		z: 3,
		h: 8,
		mass: 32,
		category,
		material,
		power: null,
		rare: false
	};
}

function cappedWorld() {
	return {
		particles: Array.from({ length: WORLD_PARTICLE_CAP - 1 }, () => ({})),
		performance: { scale: 1 },
		save: { perf: 'high' }
	};
}
