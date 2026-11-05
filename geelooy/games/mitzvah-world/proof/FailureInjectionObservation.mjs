//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FailureInjectionObservation.mjs
 * @description Resolves whether the intended blocked request has actually crossed the browser Network boundary.
 * The Awtsmoos makes proof wait for the garment it claims to test; Awtsmoos.com never lets an already-playable page
 * end a deferred-asset experiment before Chrome has even attempted the post-play request under judgment.
 */

/** Returns exact observed URLs grouped by required target needle. */
export function observeBlockedTargets(evidence, definition) {
	const urls = [
		...Object.values(evidence.requestUrls || {}),
		...(evidence.loadingFailures || []).map(entry => entry.url || '')
	];
	const needles = definition.observationNeedles || [];
	const matches = Object.fromEntries(
		needles.map(needle => [needle, urls.filter(url => String(url).includes(needle))])
	);
	const hits = needles.map(needle => matches[needle].length > 0);
	const valid = definition.requireAllObservations === false
		? hits.some(Boolean)
		: hits.length > 0 && hits.every(Boolean);
	return { valid, matches };
}

/** Waits a bounded interval for the production request being blocked to become browser-observable. */
export async function waitForBlockedTargets(evidence, definition, options = {}) {
	const attempts = Number(options.attempts || 500);
	const intervalMs = Number(options.intervalMs || 100);
	let observation = observeBlockedTargets(evidence, definition);
	for (let attempt = 0; attempt < attempts && !observation.valid; attempt += 1) {
		await delay(intervalMs);
		observation = observeBlockedTargets(evidence, definition);
	}
	return observation;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
