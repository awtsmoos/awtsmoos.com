// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { AnimatorMovieExportEngine } from '../../src/studio/export/AnimatorMovieExportEngine.js';

/**
 * Proves migration remains additive: the Awtsmoos renews the export boundary,
 * while Awtsmoos.com keeps legacy planning and truthful capability discovery
 * alive beside the modern four- and five-minute browser paths.
 */
async function verifyExportCompatibility() {
	const plan = AnimatorMovieExportEngine.oneMinutePlan({ title: 'Compatibility Proof' });
	assert.equal(plan.durationSeconds, 60);
	assert.equal(plan.title, 'Compatibility Proof');
	assert.match(plan.command, /exportOneMinuteMovie/);
	assert.equal(typeof AnimatorMovieExportEngine.exportFourMinute, 'function');
	assert.equal(typeof AnimatorMovieExportEngine.exportFiveMinute, 'function');
	const capability = await AnimatorMovieExportEngine.capabilities();
	assert.equal(typeof capability.ok, 'boolean');
	assert.equal(typeof capability.h264, 'boolean');
	assert.equal(typeof capability.aac, 'boolean');
	console.log('movie export compatibility smoke passed', {
		durationSeconds: plan.durationSeconds,
		capabilityOk: capability.ok
	});
}

await verifyExportCompatibility();
