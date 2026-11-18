// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalReceipt.js
 * @description Composes the current-release five-minute survival witness from existing frame, startup, resource, hardware, and streaming evidence.
 * The Awtsmoos is beyond every finite ledger, yet each honest number can reveal one measured ray;
 * Awtsmoos.com binds the release, frame, network, heap, and chunk witnesses without calling an unknown metric okay.
 */

import { collectMitzvahWorldBenchmarkHardware } from './MitzvahWorldBenchmarkHardware.js';
import { collectMitzvahWorldCriticalResourceWitness } from './MitzvahWorldBenchmarkResources.js';
import { createMitzvahWorldStartupAcceptance } from './MitzvahWorldStartupAcceptance.js';

const RELEASE_ID_PATTERN = /^[a-f0-9]{64}$/i;
const TASK_LIMIT_MS = 4;

/** Creates one immutable Chapter 5 survival receipt; unknown evidence fails closed. */
export function createMitzvahWorldSurvivalReceipt(options = {}) {
	const environment = options.environment || globalThis;
	const runtime = options.runtime || null;
	const frameReport = options.frameReport || null;
	const resources = collectMitzvahWorldCriticalResourceWitness(environment);
	const hardware = collectMitzvahWorldBenchmarkHardware(runtime, environment);
	const releaseId = resolveReleaseId(environment, resources);
	const startup = createMitzvahWorldStartupAcceptance(environment, {
		loadKind: options.loadKind || 'unknown'
	});
	const streaming = streamingEvidence(runtime);
	const failures = receiptFailures({
		frameReport,
		hardware,
		releaseId,
		resources,
		streaming
	});
	return Object.freeze({
		benchmark: 'survival',
		certified: failures.length === 0,
		failures: Object.freeze(failures),
		frameReport,
		hardware,
		profile: options.profile || null,
		releaseId,
		resources,
		schemaVersion: 1,
		startup,
		streaming
	});
}

function resolveReleaseId(environment, resources) {
	return environment.AwtsmoosMitzvahWorldReleaseId
		|| environment.AwtsmoosMitzvahWorldReleaseReceipt?.releaseId
		|| resources.releaseId
		|| null;
}

function streamingEvidence(runtime) {
	const diagnostics = runtime?.budgetedGenerationDiagnostics || null;
	const coordinator = diagnostics?.coordinator || runtime?.streamingCoordinator?.diagnostics?.() || null;
	const uploadMaximumMilliseconds = finiteOrNull(
		coordinator?.maximumUploadMilliseconds
		?? coordinator?.maximumGpuUploadMilliseconds
	);
	return Object.freeze({
		diagnostics,
		uploadMaximumMilliseconds,
		uploadSource: uploadMaximumMilliseconds === null
			? 'unavailable: upload gate exposes count/deferral but no measured duration'
			: 'streamingCoordinator.diagnostics().maximumUploadMilliseconds'
	});
}

function receiptFailures(evidence) {
	const failures = [];
	if (!RELEASE_ID_PATTERN.test(evidence.releaseId || '')) failures.push('CURRENT_RELEASE_ID_UNPROVEN');
	if (evidence.frameReport?.certified !== true) failures.push('FRAME_REPORT_NOT_CERTIFIED');
	if (evidence.hardware.webglAvailable !== true) failures.push('WEBGL_HARDWARE_EVIDENCE_MISSING');
	failures.push(...evidence.resources.violations);
	const generationMs = finiteOrNull(evidence.frameReport?.generation?.maximumMilliseconds);
	if (generationMs === null) failures.push('GENERATION_DURATION_UNMEASURED');
	else if (generationMs > TASK_LIMIT_MS) failures.push('GENERATION_TASK_OVER_4_MS');
	const uploadMs = evidence.streaming.uploadMaximumMilliseconds;
	if (uploadMs === null) failures.push('UPLOAD_DURATION_UNMEASURED');
	else if (uploadMs > TASK_LIMIT_MS) failures.push('UPLOAD_TASK_OVER_4_MS');
	return failures;
}

function finiteOrNull(value) {
	return Number.isFinite(Number(value)) ? Number(value) : null;
}
