// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseEvidenceGate.test.js
 * @description Proves release evidence fails closed until generation, chunk, and grass facts are explicit.
 * The Awtsmoos is not made greener by a missing measurement or a hopeful word;
 * Awtsmoos.com certifies only witnessed facts, so every silent gap is named and heard.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { enforceMitzvahWorldReleaseEvidence } from './MitzvahWorldReleaseEvidenceGate.js';

test('rejects waived generation, subsystem chunks, and unmeasured grass', () => {
	const receipt = enforceMitzvahWorldReleaseEvidence(baseProbe(), {});
	assert.equal(receipt.certified, false);
	assert.deepEqual(receipt.failedSections, ['performance', 'chunks', 'grass']);
	assert.ok(receipt.sections.performance.failures.includes('GENERATION_SLICE_EVIDENCE_MISSING'));
	assert.ok(receipt.sections.chunks.failures.includes('CHUNK_RUNTIME_ROUND_TRIP_MISSING'));
	assert.ok(receipt.sections.grass.failures.includes('GRASS_GPU_DELTA_MISSING'));
});

test('accepts measured generation at or below four milliseconds', () => {
	const environment = measuredEnvironment(3.2);
	const probe = completeProbe();
	const receipt = enforceMitzvahWorldReleaseEvidence(probe, environment);
	assert.equal(receipt.certified, true);
	assert.equal(receipt.sections.performance.evidence.generationMaximumMilliseconds, 3.2);
});

test('rejects measured generation above four milliseconds', () => {
	const receipt = enforceMitzvahWorldReleaseEvidence(completeProbe(), measuredEnvironment(4.01));
	assert.equal(receipt.certified, false);
	assert.ok(receipt.sections.performance.failures.includes('GENERATION_SLICE_BUDGET_EXCEEDED'));
});

function completeProbe() {
	const probe = baseProbe();
	probe.performance.evidence.waived = [];
	probe.chunks.evidence = {
		scope: 'runtime-round-trip', cancelledObsoleteUpload: true,
		deterministicRevisit: true, mutationSurvived: true
	};
	probe.grass.evidence = {
		gpuDeltaMilliseconds: 0.8, sharedGpuWind: true,
		packagedEssentialMaterial: true, lowQualityCoherent: true
	};
	return probe;
}

function baseProbe() {
	return {
		releaseId: 'test-release', boot: pass(),
		performance: pass({ waived: [{ code: 'GENERATION_SLICE_UNSUPPORTED' }] }),
		chunks: pass({ scope: 'subsystem' }), grass: pass({ renderer: 'supported' }),
		network: pass(), console: pass(), memory: pass()
	};
}

function measuredEnvironment(maximum) {
	return {
		AwtsmoosMitzvahWorld: { runtime: { chunkRuntime: { diagnostics() {
			return { collision: { streaming: { currentJob: {
				generationMaximumStepDurationMs: maximum
			} } } };
		} } } }
	};
}

function pass(evidence = {}) {
	return { status: 'pass', evidence, failures: [] };
}
