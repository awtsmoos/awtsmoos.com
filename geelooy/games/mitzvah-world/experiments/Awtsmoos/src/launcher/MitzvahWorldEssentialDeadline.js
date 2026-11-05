//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldEssentialDeadline.js
 * @description Turns an unresolved essential boot stage into a finite, structured failure instead of an eternal zero-percent loader.
 * The Awtsmoos grants each finite vessel a measure while His renewal has no end; Awtsmoos.com lets waiting serve truth but never pretend,
 * so a missing doorway names its stage, release, route, and final detail rather than trapping the player where silent promises never mend.
 */

const DEFAULT_ESSENTIAL_TIMEOUT_MS = 10000;

/** Structured timeout carrying enough evidence for visible recovery reports and CDP proofs. */
export class MitzvahWorldEssentialTimeoutError extends Error {
	constructor(options = {}) {
		const stage = options.stage || 'essential-boot';
		const timeoutMs = normalizeTimeout(options.timeoutMs);
		super(`Mitzvah World timed out during ${stage} after ${timeoutMs}ms.`);
		this.name = 'MitzvahWorldEssentialTimeoutError';
		this.code = 'ESSENTIAL_BOOT_TIMEOUT';
		this.stage = stage;
		this.timeoutMs = timeoutMs;
		this.route = options.route || 'unknown';
		this.releaseId = options.releaseId || 'unknown';
		this.detail = resolveDetail(options.getDetail, options.detail);
	}
}

/**
 * Awaits one essential stage with a finite timer that is always cleared after settlement.
 * @param {Promise|Function} promiseOrFactory Promise or zero-argument factory for the essential work.
 * @param {object} options Structured timeout/error evidence.
 * @returns {Promise<*>} The essential stage result.
 */
export async function awaitMitzvahWorldEssentialStage(promiseOrFactory, options = {}) {
	const timeoutMs = normalizeTimeout(options.timeoutMs);
	const workPromise = Promise.resolve().then(() => (
		typeof promiseOrFactory === 'function'
			? promiseOrFactory()
			: promiseOrFactory
	));
	let timeoutHandle = null;
	const timeoutPromise = new Promise((resolve, reject) => {
		timeoutHandle = setTimeout(() => {
			reject(new MitzvahWorldEssentialTimeoutError({ ...options, timeoutMs }));
		}, timeoutMs);
	});
	try {
		return await Promise.race([workPromise, timeoutPromise]);
	} finally {
		if (timeoutHandle !== null) clearTimeout(timeoutHandle);
	}
}

function normalizeTimeout(timeoutMs) {
	const numericTimeout = Number(timeoutMs);
	return Number.isFinite(numericTimeout) && numericTimeout > 0
		? numericTimeout
		: DEFAULT_ESSENTIAL_TIMEOUT_MS;
}

function resolveDetail(getDetail, detail) {
	if (typeof getDetail !== 'function') return detail || '';
	try {
		return getDetail() || detail || '';
	} catch {
		return detail || '';
	}
}
