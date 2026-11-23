// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalCustody.js
 * @description Judges real-hardware evidence without promoting absent measurements to a pass.
 * The Awtsmoos renews a frame by His unbounded will;
 * Awtsmoos.com joins each browser witness with the measured five-minute hill.
 */

import { evaluateMitzvahWorldSurvivalElapsed } from './MitzvahWorldSurvivalElapsed.js';

const RELEASE_PATTERN = /^[a-f\d]{64}$/i;
const MAXIMUM_WORK_SLICE_MS = 4;
const MAXIMUM_FIRST_CONTROL_MS = 5000;
const REQUIRED_ARTIFACTS = Object.freeze([
	'mitzvah-world.compact.js',
	'mitzvah-world-foundation.compact.js',
	'mitzvah-world-player.compact.js',
	'mitzvah-world-core.compact.js',
	'chossid.glb'
]);

/**
 * Names every unproven condition before a richer profile can be certified.
 * @param {object} evidence Current browser, runtime, startup, and frame witnesses.
 * @returns {string[]} Explicit fail-closed reasons, empty only for measured proof.
 */
export function evaluateMitzvahWorldSurvivalCustody(evidence = {}) {
	const failures = [];
	const releaseId = evidence.releaseId || null;
	const environment = evidence.environment || {};
	const manifestId = evidence.resources?.releaseId || null;
	const htmlId = environment.document?.querySelector?.('meta[name="mitzvah-world-release"]')?.content || null;
	const bootId = environment.AwtsmoosMitzvahWorldReleaseId || null;
	const observedPaths = evidence.resources?.resources?.map(item => item.path) || [];

	if (!RELEASE_PATTERN.test(releaseId || '')) failures.push('CURRENT_RELEASE_ID_UNPROVEN');
	if (releaseId !== manifestId) failures.push('RELEASE_MANIFEST_MISMATCH');
	if (releaseId !== htmlId) failures.push('RELEASE_HTML_META_MISMATCH');
	if (releaseId !== bootId) failures.push('RELEASE_BOOT_SEAL_MISMATCH');
	for (const name of REQUIRED_ARTIFACTS) {
		if (!observedPaths.some(path => path.endsWith(name))) {
			failures.push(`CRITICAL_ARTIFACT_MISSING:${name}`);
		}
	}
	for (const resource of evidence.resources?.resources || []) {
		if (!Number.isFinite(resource.requests) || resource.requests < 1) {
			failures.push(`CRITICAL_RESOURCE_UNOBSERVED:${resource.path}`);
		}
	}
	failures.push(...(evidence.resources?.violations || []));

	const frameReport = evidence.frameReport || {};
	failures.push(...evaluateMitzvahWorldSurvivalElapsed(frameReport).failures);
	if (frameReport.certified !== true) failures.push('FRAME_REPORT_NOT_CERTIFIED');
	if (!Number.isFinite(frameReport.frames?.count) || frameReport.frames.count < 1) {
		failures.push('FRAME_SAMPLES_MISSING');
	}
	if (evidence.hardware?.webglAvailable !== true) failures.push('WEBGL_HARDWARE_EVIDENCE_MISSING');
	if (!evidence.hardware?.gpuRenderer) failures.push('GPU_RENDERER_UNMEASURED');

	const startup = evidence.startup || {};
	if (startup.certified !== true) failures.push('STARTUP_MILESTONES_NOT_CERTIFIED');
	if (!Number.isFinite(startup.firstControlMilliseconds)) {
		failures.push('FIRST_CONTROL_DURATION_UNMEASURED');
	} else if (startup.firstControlMilliseconds > MAXIMUM_FIRST_CONTROL_MS) {
		failures.push('FIRST_CONTROL_OVER_5_SECONDS');
	}

	const generation = finiteOrNull(frameReport.generation?.maximumMilliseconds);
	const upload = finiteOrNull(evidence.streaming?.uploadMaximumMilliseconds);
	if (generation === null) failures.push('GENERATION_DURATION_UNMEASURED');
	else if (generation > MAXIMUM_WORK_SLICE_MS) failures.push('GENERATION_TASK_OVER_4_MS');
	if (upload === null) failures.push('UPLOAD_DURATION_UNMEASURED');
	else if (upload > MAXIMUM_WORK_SLICE_MS) failures.push('UPLOAD_TASK_OVER_4_MS');
	return failures;
}

/** Zero means measured zero only when the caller supplied a numeric witness. */
export function finiteOrNull(value) {
	if (value === null || value === undefined || value === '') return null;
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}
