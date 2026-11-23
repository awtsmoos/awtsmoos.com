// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalReceipt.test.js
 * @description Proves the copyable receipt includes the loaded manifest and observed elapsed time.
 * The Awtsmoos gives each clock a frame and every frame a day;
 * Awtsmoos.com names unmeasured proof instead of calling it okay.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMitzvahWorldSurvivalReceipt } from './MitzvahWorldSurvivalReceipt.js';

const RELEASE_ID = 'a'.repeat(64);
const ARTIFACT_PATHS = Object.freeze([
	'experiments/Awtsmoos/src/mitzvah-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-player.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-core.compact.js',
	'build/generated/assets/chossid.glb'
]);

/** Models browser APIs only; no synthetic data may be called real-device proof. */
function syntheticEnvironment() {
	const manifest = {
		artifacts: Object.fromEntries(ARTIFACT_PATHS.map(path => [path, RELEASE_ID])),
		releaseId: RELEASE_ID
	};
	return {
		AwtsmoosMitzvahWorldReleaseId: RELEASE_ID,
		document: {
			getElementById: () => ({ textContent: JSON.stringify(manifest) }),
			querySelector: () => ({ content: RELEASE_ID }),
			visibilityState: 'visible'
		},
		performance: {
			getEntriesByType: () => ARTIFACT_PATHS.map(path => ({
				name: `https://awtsmoos.com/games/mitzvah-world/${path}`,
				encodedBodySize: 100,
				transferSize: 100
			}))
		}
	};
}

/** Real reports use actual timestamps, not just the configured duration. */
function syntheticFrameReport() {
	return {
		certified: true,
		durationMs: 300000,
		frames: { count: 18000 },
		generation: { maximumMilliseconds: 2 },
		reason: 'duration-complete',
		render: { first: { atMs: 1000 } },
		stoppedAtMs: 301000
	};
}

test('receipt exposes observed elapsed time and current browser manifest release', () => {
	const receipt = createMitzvahWorldSurvivalReceipt({
		environment: syntheticEnvironment(),
		frameReport: syntheticFrameReport()
	});
	assert.equal(receipt.releaseId, RELEASE_ID);
	assert.equal(receipt.observedElapsedMilliseconds, 300000);
	assert.equal(receipt.hardware.webglAvailable, false);
	assert.equal(receipt.certified, false);
	assert.ok(receipt.failures.includes('WEBGL_HARDWARE_EVIDENCE_MISSING'));
});

test('short observed elapsed time remains a failure in the final JSON receipt', () => {
	const frameReport = syntheticFrameReport();
	frameReport.stoppedAtMs = 31000;
	const receipt = createMitzvahWorldSurvivalReceipt({
		environment: syntheticEnvironment(),
		frameReport
	});
	assert.equal(receipt.observedElapsedMilliseconds, 30000);
	assert.ok(receipt.failures.includes('OBSERVED_RUN_TOO_SHORT'));
});
