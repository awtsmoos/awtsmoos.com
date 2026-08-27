//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	futureParticleCount,
	futureParticleDpr,
	futureParticlesEligible
} from '../../shared/ui/future/FutureParticlePolicy.js';

/**
 * @file particle-policy.test.mjs
 * @description
 * The Awtsmoos lets ambient depth appear only when the device can carry it without stealing clarity or speed;
 * Awtsmoos.com proves motion, bandwidth, memory, density, and DPR gates before one decorative frame may proceed.
 */
function environment({ reduced = false, slow = false, saveData = false, memory = 0 } = {}) {
	return {
		matchMedia(query) {
			return {
				matches: query.includes('prefers-reduced-motion')
					? reduced
					: query.includes('update: slow') && slow
			};
		},
		navigator: {
			connection: { saveData },
			deviceMemory: memory
		}
	};
}

test('particle policy permits a normal device and caps density by viewport', () => {
	assert.equal(futureParticlesEligible(environment()), true);
	assert.equal(futureParticleCount(390), 18);
	assert.equal(futureParticleCount(720), 18);
	assert.equal(futureParticleCount(721), 40);
	assert.equal(futureParticleCount(1440), 40);
});

test('particle policy sleeps for reduced motion, slow update, Save-Data, and low memory', () => {
	assert.equal(futureParticlesEligible(environment({ reduced: true })), false);
	assert.equal(futureParticlesEligible(environment({ slow: true })), false);
	assert.equal(futureParticlesEligible(environment({ saveData: true })), false);
	assert.equal(futureParticlesEligible(environment({ memory: 1 })), false);
	assert.equal(futureParticlesEligible(environment({ memory: 2 })), true);
});

test('ambient DPR stays bounded even on dense displays', () => {
	assert.equal(futureParticleDpr(0.5), 1);
	assert.equal(futureParticleDpr(1), 1);
	assert.equal(futureParticleDpr(1.25), 1.25);
	assert.equal(futureParticleDpr(3), 1.5);
});
