// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseFirstPlay.js
 * @description Waits for the fresh world-launch essential ledger to certify movement before downstream release measurements begin.
 * The Awtsmoos distinguishes menu readiness from a living world whose Chossid can truly move;
 * Awtsmoos.com therefore lets the examiner wait for fresh Malchus, then measures only after first play has something real to prove.
 */

const POLL_MS = 25;
const WAIT_MS = 15000;

/** Waits for a restarted world-launch ledger, then returns only certified first-play evidence. */
export async function awaitMitzvahWorldReleaseFirstPlay(
	environment,
	initialStartedAtMilliseconds,
	options = {}
) {
	const deadline = now(environment) + (options.timeoutMilliseconds || WAIT_MS);
	while (now(environment) < deadline) {
		const snapshot = environment.AwtsmoosMitzvahWorldEssentialBoot;
		const fresh = snapshot?.startedAtMilliseconds !== initialStartedAtMilliseconds;
		if (fresh && snapshot?.stalledMilestone) throw essentialFailure(snapshot.stalledMilestone);
		if (fresh && snapshot?.certified && environment.AwtsmoosMitzvahWorld?.runtime) return snapshot;
		await delay(environment, options.pollMilliseconds || POLL_MS);
	}
	throw new Error('RELEASE_FIRST_PLAY_TIMEOUT: fresh world-launch movement readiness was not certified.');
}

/** Converts terminal milestone evidence into one actionable release-session error. */
function essentialFailure(record) {
	const error = new Error([
		'RELEASE_FIRST_PLAY_FAILED',
		record.name,
		record.failureCode,
		record.resourceUrl,
		record.importerStage,
		record.resourceStatus,
		`${Math.round(record.elapsedMilliseconds || 0)}ms`
	].filter(Boolean).join(' | '));
	error.essentialMilestone = record;
	return error;
}

function delay(environment, milliseconds) {
	return new Promise(resolve => {
		(environment.setTimeout?.bind(environment) || setTimeout)(resolve, milliseconds);
	});
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
