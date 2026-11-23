// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalReceipt.js
 * @description Composes actual elapsed time, accepted movement, streaming work and current release custody.
 * The Awtsmoos restores each frame anew without a finite clock;
 * Awtsmoos.com joins the browser's seal to a measured temporal rock.
 */

import { collectMitzvahWorldBenchmarkHardware } from './MitzvahWorldBenchmarkHardware.js';
import { collectMitzvahWorldCriticalResourceWitness } from './MitzvahWorldBenchmarkResources.js';
import { createMitzvahWorldStartupAcceptance } from './MitzvahWorldStartupAcceptance.js';
import { collectMitzvahWorldAcceptedMovementAcceptance } from './MitzvahWorldAcceptedMovementAcceptance.js';
import { evaluateMitzvahWorldSurvivalElapsed } from './MitzvahWorldSurvivalElapsed.js';
import {
	evaluateMitzvahWorldSurvivalCustody,
	finiteOrNull
} from './MitzvahWorldSurvivalCustody.js';

/**
 * Keeps current loaded release, frame measurements and movement proof together.
 * @param {object} options Recorder, runtime and live browser context.
 * @returns {object} Immutable copyable fail-closed JSON receipt.
 */
export function createMitzvahWorldSurvivalReceipt(options = {}) {
	const environment = options.environment || globalThis;
	const runtime = options.runtime || null;
	const frameReport = options.frameReport || null;
	const resources = collectMitzvahWorldCriticalResourceWitness(environment);
	const hardware = collectMitzvahWorldBenchmarkHardware(runtime, environment);
	const releaseId = resources.releaseId;
	const startup = createMitzvahWorldStartupAcceptance(environment, {
		loadKind: options.loadKind || 'unknown'
	});
	const acceptedMovement = collectMitzvahWorldAcceptedMovementAcceptance(environment);
	const streaming = collectSurvivalStreamingEvidence(runtime);
	const elapsedEvidence = evaluateMitzvahWorldSurvivalElapsed(frameReport || {});
	const failures = [
		...evaluateMitzvahWorldSurvivalCustody({
			environment,
			frameReport,
			hardware,
			releaseId,
			resources,
			startup,
			streaming
		}),
		...acceptedMovement.failures
	];
	return Object.freeze({
		acceptedMovement,
		benchmark: 'survival',
		certified: failures.length === 0,
		failures: Object.freeze(failures),
		frameReport,
		hardware,
		observedElapsedMilliseconds: elapsedEvidence.elapsedMilliseconds,
		profile: options.profile || null,
		releaseId,
		releaseIdSource: 'document-manifest',
		resources,
		schemaVersion: 3,
		startup,
		streaming
	});
}

/** Records synchronous upload submission duration, not asynchronous GPU completion. */
function collectSurvivalStreamingEvidence(runtime) {
	const diagnostics = runtime?.budgetedGenerationDiagnostics || null;
	const coordinator = diagnostics?.coordinator
		|| runtime?.streamingCoordinator?.diagnostics?.()
		|| null;
	const uploadMaximumMilliseconds = finiteOrNull(
		coordinator?.maximumUploadMilliseconds
		?? coordinator?.maximumGpuUploadMilliseconds
	);
	return Object.freeze({
		diagnostics,
		uploadMaximumMilliseconds,
		uploadSource: uploadMaximumMilliseconds === null
			? 'unavailable: no measured upload submission duration'
			: 'streamingCoordinator.diagnostics().maximumUploadMilliseconds'
	});
}
