// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseEvidenceGate.js
 * @description Refuses release certification when mandatory runtime evidence is asserted, waived, or absent.
 * The Awtsmoos is truth before every finite receipt can claim a name;
 * Awtsmoos.com therefore calls an unknown proof a failure, never paints missing evidence green, and never blesses a guessing game.
 */

import { readMitzvahWorldGenerationMaximum } from './MitzvahWorldReleaseRuntimeEvidence.js';

const GLOBAL_NAME = 'AwtsmoosMitzvahWorldReleaseGateEvidence';
const MAXIMUM_GENERATION_SLICE_MS = 4;

/** Converts the broad probe into one strict, globally readable release-gate receipt. */
export function enforceMitzvahWorldReleaseEvidence(probe, environment = globalThis) {
	const sections = Object.freeze({
		boot: preserve(probe?.boot, 'BOOT_EVIDENCE_MISSING'),
		performance: strictPerformance(probe?.performance, environment),
		chunks: strictChunks(probe?.chunks),
		grass: strictGrass(probe?.grass),
		network: preserve(probe?.network, 'NETWORK_EVIDENCE_MISSING'),
		console: preserve(probe?.console, 'CONSOLE_EVIDENCE_MISSING'),
		memory: preserve(probe?.memory, 'MEMORY_EVIDENCE_MISSING')
	});
	const failedSections = Object.entries(sections)
		.filter(([, section]) => section.status !== 'pass')
		.map(([name]) => name);
	const receipt = Object.freeze({
		certified: failedSections.length === 0,
		failedSections: Object.freeze(failedSections),
		releaseId: probe?.releaseId || null,
		sections
	});
	environment[GLOBAL_NAME] = receipt;
	return receipt;
}

function strictPerformance(section, environment) {
	const failures = [...(section?.failures || [])];
	const generation = readMitzvahWorldGenerationMaximum(environment);
	if (section?.status !== 'pass') failures.push('PERFORMANCE_PROBE_FAILED');
	removeFailure(failures, 'GENERATION_SLICE_UNSUPPORTED');
	if (!Number.isFinite(generation)) {
		failures.push('GENERATION_SLICE_EVIDENCE_MISSING');
	} else if (generation > MAXIMUM_GENERATION_SLICE_MS) {
		failures.push('GENERATION_SLICE_BUDGET_EXCEEDED');
	}
	return result({
		...(section?.evidence || {}),
		generationMaximumMilliseconds: generation
	}, failures);
}

function strictChunks(section) {
	const evidence = section?.evidence || {};
	const failures = [...(section?.failures || [])];
	if (section?.status !== 'pass') failures.push('CHUNK_PROBE_FAILED');
	if (evidence.scope !== 'runtime-round-trip') failures.push('CHUNK_RUNTIME_ROUND_TRIP_MISSING');
	if (evidence.cancelledObsoleteUpload !== true) failures.push('CHUNK_CANCELLATION_PROOF_MISSING');
	if (evidence.deterministicRevisit !== true) failures.push('CHUNK_REVISIT_PROOF_MISSING');
	if (evidence.mutationSurvived !== true) failures.push('CHUNK_MUTATION_PROOF_MISSING');
	return result(evidence, failures);
}

function strictGrass(section) {
	const evidence = section?.evidence || {};
	const failures = [...(section?.failures || [])];
	if (section?.status !== 'pass') failures.push('GRASS_PROBE_FAILED');
	if (!Number.isFinite(evidence.gpuDeltaMilliseconds)) failures.push('GRASS_GPU_DELTA_MISSING');
	else if (evidence.gpuDeltaMilliseconds > 1) failures.push('GRASS_GPU_BUDGET_EXCEEDED');
	if (evidence.sharedGpuWind !== true) failures.push('GRASS_GPU_WIND_PROOF_MISSING');
	if (evidence.packagedEssentialMaterial !== true) failures.push('GRASS_PACKAGE_PROOF_MISSING');
	if (evidence.lowQualityCoherent !== true) failures.push('GRASS_LOW_QUALITY_PROOF_MISSING');
	return result(evidence, failures);
}

function preserve(section, missingCode) {
	if (section?.status === 'pass') return section;
	return result(section?.evidence || null, [...(section?.failures || []), missingCode]);
}

function removeFailure(failures, code) {
	for (let index = failures.length - 1; index >= 0; index -= 1) {
		if (failures[index] === code) failures.splice(index, 1);
	}
}

function result(evidence, failures) {
	const unique = Object.freeze([...new Set(failures)]);
	return Object.freeze({
		evidence: Object.freeze(evidence || {}),
		failures: unique,
		status: unique.length === 0 ? 'pass' : 'fail'
	});
}
