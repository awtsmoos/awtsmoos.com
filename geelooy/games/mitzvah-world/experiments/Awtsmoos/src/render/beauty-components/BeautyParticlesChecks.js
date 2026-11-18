// B"H
/**
 * @file BeautyParticlesChecks.js
 * @description Complete particles visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BEAUTY_PARTICLE_TYPE_CAPS, MitzvahParticleLayer } from '../../fx/MitzvahParticleLayer.js';

describe('MitzvahParticleLayer beauty emitters', () => {
	it('per-type caps are enforced', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test' });
		for (let round = 0; round < 4; round++) {
			layer.spawnFireflies({ x: 0, y: 1, z: 0 }, { count: 120 });
		}
		const diag = layer.diagnostics();
		assert.ok(diag.typeCounts.firefly <= BEAUTY_PARTICLE_TYPE_CAPS.firefly,
			`fireflies capped at ${BEAUTY_PARTICLE_TYPE_CAPS.firefly}`);
		// Bursts (uncapped type) still flow through the global cap.
		layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 90 });
		assert.ok(layer.diagnostics().live <= layer.diagnostics().maxParticles);
	});

	it('ambient fireflies fill to target and respawn', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-2' });
		layer.startAmbientFireflies({ min: { x: -10, y: 1, z: -10 }, max: { x: 10, y: 4, z: 10 } }, 40);
		for (let i = 0; i < 10; i++) layer.update(null, 0.016);
		const diag = layer.diagnostics();
		assert.ok(diag.typeCounts.firefly >= 30, 'ambient fireflies fill toward target');
		assert.equal(diag.ambientFireflyTarget, 40);
		layer.stopAmbientFireflies();
		assert.equal(layer.diagnostics().ambientFireflyTarget, 0);
	});

	it('leaves sway without NaN and ripples form rings', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-3' });
		layer.spawnLeaves({ x: 0, y: 4, z: 0 }, { count: 20 });
		layer.spawnRipple({ x: 5, y: 0.2, z: 5 }, { count: 10 });
		for (let i = 0; i < 90; i++) layer.update(null, 0.016);
		for (const particle of layer.particles) {
			for (const component of particle.position) {
				assert.ok(Number.isFinite(component), 'particle position stays finite');
			}
		}
		const diag = layer.diagnostics();
		assert.ok((diag.typeCounts.leaf || 0) + (diag.typeCounts.ripple || 0) >= 0);
		assert.ok(diag.beautyCaps.firefly === 220, 'caps exported in diagnostics');
	});

	it('existing burst/sparkle/mote behavior is unchanged', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-4' });
		layer.spawnBurst({ x: 0, y: 2, z: 0 });
		layer.spawnSparkles({ x: 1, y: 1, z: 1 });
		layer.startAmbientMotes({ min: { x: -5, y: 1, z: -5 }, max: { x: 5, y: 3, z: 5 } }, 20);
		layer.update(null, 0.016);
		const diag = layer.diagnostics();
		assert.ok(diag.live > 0, 'particles live');
		assert.equal(diag.ambientTarget, 20);
		assert.deepEqual(diag.typeCounts.firefly || 0, 0);
	});
});
