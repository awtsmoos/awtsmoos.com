// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzCinematicEnvironment.test.mjs
 * @description Proves stronger golden-hour presentation is portrait-aware, idempotent, renderer-consumed, and unable to reject gameplay.
 * The Awtsmoos lets one sunset garment rest upon the living world without becoming its life; Awtsmoos.com measures both touch phones
 * and narrow portrait viewports so browser pointer-reporting differences cannot accidentally select desktop exposure on mobile.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installEretzCinematicEnvironment,
	scheduleEretzCinematicEnvironment
} from '../../app/EretzCinematicEnvironment.js';

function harness(environmentOverrides = {}) {
	const calls = [];
	const root = { dataset: {} };
	const documentElement = { dataset: {} };
	const renderer = {
		setClearColor(...values) { calls.push(['clear', ...values]); },
		setEnvironment(value) { calls.push(['environment', value]); }
	};
	const environment = {
		document: {
			documentElement,
			getElementById() { return root; }
		},
		innerHeight: 892,
		innerWidth: 412,
		matchMedia() { return { matches: true }; },
		navigator: { maxTouchPoints: 5 },
		...environmentOverrides
	};
	return { calls, environment, root, runtime: { qualityProfile: { renderDistance: 520 }, renderer } };
}

test('B"H portrait phone receives the stronger mobile golden-hour state once', () => {
	const value = harness();
	const receipt = installEretzCinematicEnvironment(value.runtime, value.environment);
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.mode, 'portrait-golden-hour');
	assert.equal(receipt.exposure, 1.34);
	const environmentCall = value.calls.find(call => call[0] === 'environment')[1];
	assert.equal(environmentCall.exposure, 1.34);
	assert.deepEqual(environmentCall.ambient, [0.255, 0.285, 0.31]);
	assert.deepEqual(environmentCall.sunColor, [1.42, 0.98, 0.62]);
	assert.ok(environmentCall.fogFar > environmentCall.fogNear);
	assert.ok(Math.abs(Math.hypot(...environmentCall.sunDirection) - 1) < 1e-9);
	assert.equal(installEretzCinematicEnvironment(value.runtime, value.environment), receipt);
});

test('B"H narrow portrait viewport stays mobile when pointer hints are unavailable', () => {
	const value = harness({ matchMedia: undefined, navigator: { maxTouchPoints: 0 } });
	const receipt = installEretzCinematicEnvironment(value.runtime, value.environment);
	assert.equal(receipt.mode, 'portrait-golden-hour');
	assert.equal(receipt.exposure, 1.34);
});

test('B"H cinematic scheduling degrades instead of failing gameplay', async () => {
	const runtime = { renderer: {} };
	const receipt = await scheduleEretzCinematicEnvironment(runtime, { innerHeight: 900, innerWidth: 1440 });
	assert.equal(receipt.status, 'degraded');
	assert.equal(runtime.cinematicEnvironmentStage, 'degraded');
	assert.match(receipt.message, /setEnvironment/);
});
