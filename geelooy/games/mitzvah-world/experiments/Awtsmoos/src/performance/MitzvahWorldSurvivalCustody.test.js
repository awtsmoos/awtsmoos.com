// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalCustody.test.js
 * @description Checks that release custody denies incomplete real-device evidence.
 * The Awtsmoos renews each living ray;
 * Awtsmoos.com lets no pretend five-minute certificate slip away.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateMitzvahWorldSurvivalCustody, finiteOrNull } from './MitzvahWorldSurvivalCustody.js';

const RELEASE_ID = 'a'.repeat(64);
const ARTIFACTS = Object.freeze([
	'mitzvah-world.compact.js',
	'mitzvah-world-foundation.compact.js',
	'mitzvah-world-player.compact.js',
	'mitzvah-world-core.compact.js',
	'chossid.glb'
]);

/** Builds only synthetic fixture evidence; this never represents a real device run. */
function measuredFixture() {
	return {
		environment: {
			AwtsmoosMitzvahWorldReleaseId: RELEASE_ID,
			document: { querySelector: () => ({ content: RELEASE_ID }) }
		},
		frameReport: {
			certified: true,
			durationMs: 300000,
			frames: { count: 18000 },
			generation: { maximumMilliseconds: 2 },
			reason: 'duration-complete',
			render: { first: { atMs: 1000 } },
			stoppedAtMs: 301000
		},
		hardware: { gpuRenderer: 'Synthetic fixture', webglAvailable: true },
		releaseId: RELEASE_ID,
		resources: {
			releaseId: RELEASE_ID,
			resources: ARTIFACTS.map(path => ({ path, requests: 1 })),
			violations: []
		},
		startup: { certified: true, firstControlMilliseconds: 4500 },
		streaming: { uploadMaximumMilliseconds: 1 }
	};
}

test('complete synthetic fixture passes only the custody predicate', () => {
	assert.deepEqual(evaluateMitzvahWorldSurvivalCustody(measuredFixture()), []);
});

test('stopped-early run cannot be certified', () => {
	const evidence = measuredFixture();
	evidence.frameReport.reason = 'stopped-early';
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('FIVE_MINUTE_RUN_INCOMPLETE'));
});

test('a forged duration-complete reason with short observed time fails', () => {
	const evidence = measuredFixture();
	evidence.frameReport.stoppedAtMs = 31000;
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('OBSERVED_RUN_TOO_SHORT'));
});

test('missing browser timestamps must fail even if the target duration says five minutes', () => {
	const evidence = measuredFixture();
	evidence.frameReport.render.first.atMs = null;
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('OBSERVED_RUN_ELAPSED_UNMEASURED'));
});

test('stale boot release hash is rejected', () => {
	const evidence = measuredFixture();
	evidence.environment.AwtsmoosMitzvahWorldReleaseId = 'b'.repeat(64);
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('RELEASE_BOOT_SEAL_MISMATCH'));
});

test('HTML meta must agree with manifest', () => {
	const evidence = measuredFixture();
	evidence.environment.document.querySelector = () => ({ content: 'c'.repeat(64) });
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('RELEASE_HTML_META_MISMATCH'));
});

test('missing Chossid is called out by name', () => {
	const evidence = measuredFixture();
	evidence.resources.resources.pop();
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).includes('CRITICAL_ARTIFACT_MISSING:chossid.glb'));
});

test('unobserved network resource is not presented as a fetch', () => {
	const evidence = measuredFixture();
	evidence.resources.resources[0].requests = 0;
	assert.ok(evaluateMitzvahWorldSurvivalCustody(evidence).some(reason => reason.startsWith('CRITICAL_RESOURCE_UNOBSERVED:')));
});

test('missing work durations are not silently converted to zero', () => {
	const evidence = measuredFixture();
	evidence.frameReport.generation.maximumMilliseconds = null;
	evidence.streaming.uploadMaximumMilliseconds = null;
	const failures = evaluateMitzvahWorldSurvivalCustody(evidence);
	assert.ok(failures.includes('GENERATION_DURATION_UNMEASURED'));
	assert.ok(failures.includes('UPLOAD_DURATION_UNMEASURED'));
	assert.equal(finiteOrNull(null), null);
});

test('missing hardware and first-control fail closed', () => {
	const evidence = measuredFixture();
	evidence.hardware.webglAvailable = false;
	evidence.startup.firstControlMilliseconds = null;
	const failures = evaluateMitzvahWorldSurvivalCustody(evidence);
	assert.ok(failures.includes('WEBGL_HARDWARE_EVIDENCE_MISSING'));
	assert.ok(failures.includes('FIRST_CONTROL_DURATION_UNMEASURED'));
});
