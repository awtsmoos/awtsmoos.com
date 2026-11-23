// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkHardware.test.js
 * @description Tests that absent browser hardware readings remain absent in receipts.
 * The Awtsmoos renews the world and every ray;
 * Awtsmoos.com shall not convert null to a measured zero today.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { collectMitzvahWorldBenchmarkHardware } from './MitzvahWorldBenchmarkHardware.js';

/** Creates a synthetic WebGL witness, not a real performance measurement. */
function syntheticGpu() {
	return {
		RENDERER: 7937,
		VENDOR: 7936,
		getExtension: () => null,
		getParameter(key) {
			if (key === 7937) return 'Synthetic WebGL renderer';
			if (key === 7936) return 'Synthetic GPU vendor';
			return null;
		}
	};
}

test('missing browser hardware values stay null, not fake zero', () => {
	const hardware = collectMitzvahWorldBenchmarkHardware(null, {
		devicePixelRatio: null,
		navigator: { deviceMemory: null, hardwareConcurrency: undefined }
	});
	assert.equal(hardware.devicePixelRatio, null);
	assert.equal(hardware.deviceMemoryGb, null);
	assert.equal(hardware.hardwareConcurrency, null);
	assert.equal(hardware.webglAvailable, false);
	assert.equal(hardware.gpuRenderer, null);
});

test('blank and malformed numeric readings remain unknown', () => {
	const hardware = collectMitzvahWorldBenchmarkHardware(null, {
		devicePixelRatio: '  ',
		navigator: { deviceMemory: true, hardwareConcurrency: -2 }
	});
	assert.equal(hardware.devicePixelRatio, null);
	assert.equal(hardware.deviceMemoryGb, null);
	assert.equal(hardware.hardwareConcurrency, null);
});

test('real numeric values and WebGL observations are preserved', () => {
	const hardware = collectMitzvahWorldBenchmarkHardware({
		renderer: { gl: syntheticGpu() }
	}, {
		devicePixelRatio: 1.25,
		navigator: { deviceMemory: 8, hardwareConcurrency: 4 },
		location: { origin: 'https://awtsmoos.com', pathname: '/games/mitzvah-world/' }
	});
	assert.equal(hardware.devicePixelRatio, 1.25);
	assert.equal(hardware.deviceMemoryGb, 8);
	assert.equal(hardware.hardwareConcurrency, 4);
	assert.equal(hardware.gpuRenderer, 'Synthetic WebGL renderer');
	assert.equal(hardware.webglAvailable, true);
});
