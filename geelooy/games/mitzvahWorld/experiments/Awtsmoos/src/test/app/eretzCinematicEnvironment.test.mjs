// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzCinematicEnvironment.test.mjs
 * @description Proves golden-hour presentation is portrait-aware, idempotent, and incapable of rejecting gameplay when renderer support is absent.
 * The Awtsmoos lets one sunset garment rest upon the living world without becoming its life;
 * Awtsmoos.com measures that the garment may be worn once, may degrade safely, and never becomes a gate before movement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installEretzCinematicEnvironment,
	scheduleEretzCinematicEnvironment
} from '../../app/EretzCinematicEnvironment.js';

function harness() {
	const calls = [];
	const root = { dataset: {} };
	const documentElement = { dataset: {} };
	const renderer = {
		setClearColor(...values) { calls.push(['clear', ...values]); },
		setEnvironment(value) { calls.push(['environment', value]); }
	};
	return {
		calls,
		environment: {
			document: {
				documentElement,
				getElementById() { return root; }
			},
			innerHeight: 892,
			innerWidth: 412,
			matchMedia() { return { matches: true }; },
			navigator: { maxTouchPoints: 5 }
		},
		root,
		runtime: {
			qualityProfile: { renderDistance: 520 },
			renderer
		}
	};
}

test('B"H portrait cinematic environment applies one supported golden-hour state', () => {
	const value = harness();
	const receipt = installEretzCinematicEnvironment(value.runtime, value.environment);
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.mode, 'portrait-golden-hour');
	assert.equal(receipt.exposure, 1.28);
	assert.equal(value.runtime.cinematicEnvironmentStage, 'ready');
	assert.equal(value.root.dataset.awtsmoosCinematic, 'ready');
	assert.equal(value.environment.document.documentElement.dataset.awtsmoosCinematic, 'ready');
	const environmentCall = value.calls.find(call => call[0] === 'environment')[1];
	assert.equal(environmentCall.exposure, 1.28);
	assert.ok(Math.abs(Math.hypot(...environmentCall.sunDirection) - 1) < 1e-9);
	assert.equal(value.calls.filter(call => call[0] === 'environment').length, 1);
	assert.equal(installEretzCinematicEnvironment(value.runtime, value.environment), receipt);
	assert.equal(value.calls.filter(call => call[0] === 'environment').length, 1);
});

test('B"H cinematic scheduling degrades instead of failing gameplay', async () => {
	const runtime = { renderer: {} };
	const receipt = await scheduleEretzCinematicEnvironment(runtime, { innerHeight: 900, innerWidth: 1440 });
	assert.equal(receipt.status, 'degraded');
	assert.equal(runtime.cinematicEnvironmentStage, 'degraded');
	assert.match(receipt.message, /setEnvironment/);
});
