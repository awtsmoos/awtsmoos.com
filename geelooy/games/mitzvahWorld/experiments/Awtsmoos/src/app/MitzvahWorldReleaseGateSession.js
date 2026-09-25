// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseGateSession.js
 * @description Waits for real world-launch first play, then runs traversal, chunk, grass, and strict release evidence as one session.
 * The Awtsmoos lets the menu open before the living world is mistaken for ready;
 * Awtsmoos.com remembers the first ledger, waits for fresh movement Malchus, then measures the meadow only when runtime truth is steady.
 */

import { MITZVAH_WORLD_RELEASE_ID } from '../launcher/MitzvahWorldReleaseIdentity.js';
import { runMitzvahWorldChunkReleaseProbe } from './MitzvahWorldChunkReleaseProbe.js';
import { runMitzvahWorldGrassReleaseProbe } from './MitzvahWorldGrassReleaseProbe.js';
import { enforceMitzvahWorldReleaseEvidence } from './MitzvahWorldReleaseEvidenceGate.js';
import { awaitMitzvahWorldReleaseFirstPlay } from './MitzvahWorldReleaseFirstPlay.js';
import { runMitzvahWorldReleaseProbe } from './MitzvahWorldReleaseProbe.js';

const SESSION_GLOBAL = 'AwtsmoosMitzvahWorldReleaseGateSession';

/** Runs the automatic release session once and leaves a serializable global receipt. */
export function startMitzvahWorldReleaseGateSession(environment = globalThis) {
	if (environment[SESSION_GLOBAL]?.promise) return environment[SESSION_GLOBAL].promise;
	const initialEssentialStart = environment.AwtsmoosMitzvahWorldEssentialBoot?.startedAtMilliseconds ?? null;
	const session = {
		state: 'waiting-for-world-first-play',
		startedAtMilliseconds: now(environment),
		promise: null
	};
	session.promise = runSession(environment, session, initialEssentialStart);
	environment[SESSION_GLOBAL] = session;
	return session.promise;
}

async function runSession(environment, session, initialEssentialStart) {
	try {
		await environment.AwtsmoosMitzvahWorldBootPromise;
		const firstPlay = await awaitMitzvahWorldReleaseFirstPlay(environment, initialEssentialStart);
		session.firstPlay = firstPlay;
		session.state = 'probing';
		const traversal = await runMitzvahWorldReleaseProbe(environment, {
			releaseId: MITZVAH_WORLD_RELEASE_ID
		});
		const chunks = runMitzvahWorldChunkReleaseProbe(environment);
		const grass = await runMitzvahWorldGrassReleaseProbe(environment);
		const probe = augmentProbe(traversal, chunks, grass);
		const evidence = enforceMitzvahWorldReleaseEvidence(probe, environment);
		completeSession(session, evidence.certified ? 'passed' : 'failed', probe, evidence);
		return evidence;
	} catch (error) {
		const evidence = bootFailureEvidence(error);
		environment.AwtsmoosMitzvahWorldReleaseGateEvidence = evidence;
		completeSession(session, 'failed', null, evidence, error);
		return evidence;
	}
}

function augmentProbe(probe, chunks, grass) {
	return Object.freeze({
		...probe,
		chunks: section(chunks, chunkFailures(chunks)),
		grass: section(grass, grass.status === 'pass' ? [] : ['GRASS_PROBE_FAILED'])
	});
}

function chunkFailures(evidence) {
	const failures = [];
	if (evidence.cancelledObsoleteUpload !== true) failures.push('CHUNK_CANCELLATION_PROOF_MISSING');
	if (evidence.deterministicRevisit !== true) failures.push('CHUNK_REVISIT_PROOF_MISSING');
	if (evidence.mutationSurvived !== true) failures.push('CHUNK_MUTATION_PROOF_MISSING');
	if (evidence.finalRecordCount !== evidence.baselineRecordCount) failures.push('CHUNK_BASELINE_NOT_RESTORED');
	return failures;
}

function section(evidence, failures) {
	return Object.freeze({
		evidence,
		failures: Object.freeze(failures),
		status: failures.length === 0 ? 'pass' : 'fail'
	});
}

function completeSession(session, state, probe, evidence, error = null) {
	session.state = state;
	session.completedAtMilliseconds = Date.now();
	session.probe = probe;
	session.evidence = evidence;
	session.error = error ? { message: error?.message || String(error), name: error?.name || 'Error' } : null;
}

function bootFailureEvidence(error) {
	const milestone = error?.essentialMilestone || null;
	return Object.freeze({
		certified: false,
		failedSections: Object.freeze(['boot']),
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		sections: Object.freeze({
			boot: Object.freeze({
				evidence: Object.freeze({ message: error?.message || String(error), milestone }),
				failures: Object.freeze(['FIRST_PLAY_NOT_CERTIFIED']),
				status: 'fail'
			})
		})
	});
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
