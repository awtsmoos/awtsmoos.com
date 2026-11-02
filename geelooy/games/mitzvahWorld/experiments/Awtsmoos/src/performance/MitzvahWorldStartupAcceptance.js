// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldStartupAcceptance.js
 * @description Derives release startup gates from the existing five-proof essential ledger instead of inventing a second clock.
 * The Awtsmoos renews entry, frame, earth, Chossid, and motion as one chain of truth;
 * Awtsmoos.com measures that chain without weakening the watchdog that protects slower real devices in proof.
 */

const WARM_FIRST_FRAME_LIMIT_MS = 1500;
const COLD_FIRST_CONTROL_LIMIT_MS = 5000;
const CHOSSID_TO_MOVEMENT_LIMIT_MS = 500;
const REQUIRED_SERIES_LOADS = 10;

/** Creates one immutable warm/cold startup acceptance receipt from existing milestone evidence. */
export function createMitzvahWorldStartupAcceptance(environment = globalThis, options = {}) {
	const essential = options.essentialSnapshot || environment.AwtsmoosMitzvahWorldEssentialBoot || null;
	const loadKind = options.loadKind || 'unknown';
	const origin = finite(environment.AwtsmoosMitzvahWorldScriptStart)
		?? finite(essential?.startedAtMilliseconds);
	const firstFrameAt = completedAt(essential, 'rendererFirstFrame');
	const chossidAt = completedAt(essential, 'canonicalChossidDecoded');
	const movementAt = completedAt(essential, 'playerMovementEnabled');
	const firstFrameMilliseconds = delta(origin, firstFrameAt);
	const firstControlMilliseconds = delta(origin, movementAt);
	const chossidToMovementMilliseconds = delta(chossidAt, movementAt);
	const failures = startupFailures({
		chossidToMovementMilliseconds,
		essential,
		firstControlMilliseconds,
		firstFrameMilliseconds,
		loadKind
	});
	return Object.freeze({
		certified: failures.length === 0,
		chossidToMovementMilliseconds,
		failures: Object.freeze(failures),
		firstControlMilliseconds,
		firstFrameMilliseconds,
		fiveProofsCertified: essential?.certified === true,
		loadKind
	});
}

/** Requires ten consecutive fully certified startup receipts. */
export function evaluateMitzvahWorldStartupSeries(receipts = []) {
	const considered = receipts.slice(-REQUIRED_SERIES_LOADS);
	const certified = considered.length === REQUIRED_SERIES_LOADS
		&& considered.every(receipt => receipt?.certified === true && receipt?.fiveProofsCertified === true);
	return Object.freeze({ certified, count: considered.length, required: REQUIRED_SERIES_LOADS });
}

function startupFailures(metrics) {
	const failures = [];
	if (metrics.essential?.certified !== true) failures.push('ESSENTIAL_FIVE_PROOFS_INCOMPLETE');
	if (!Number.isFinite(metrics.chossidToMovementMilliseconds)) failures.push('CHOSSID_TO_MOVEMENT_UNSUPPORTED');
	if (metrics.chossidToMovementMilliseconds > CHOSSID_TO_MOVEMENT_LIMIT_MS) failures.push('CHOSSID_TO_MOVEMENT_OVER_500_MS');
	if (metrics.loadKind === 'warm') {
		if (!Number.isFinite(metrics.firstFrameMilliseconds)) failures.push('WARM_FIRST_FRAME_UNSUPPORTED');
		if (metrics.firstFrameMilliseconds > WARM_FIRST_FRAME_LIMIT_MS) failures.push('WARM_FIRST_FRAME_OVER_1500_MS');
	}
	if (metrics.loadKind === 'cold') {
		if (!Number.isFinite(metrics.firstControlMilliseconds)) failures.push('COLD_FIRST_CONTROL_UNSUPPORTED');
		if (metrics.firstControlMilliseconds > COLD_FIRST_CONTROL_LIMIT_MS) failures.push('COLD_FIRST_CONTROL_OVER_5000_MS');
	}
	return failures;
}

function completedAt(essential, name) {
	return finite(essential?.milestones?.[name]?.completedAtMilliseconds);
}

function delta(start, end) {
	return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null;
}

function finite(value) {
	if (value === null || value === undefined || value === '') return null;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}
