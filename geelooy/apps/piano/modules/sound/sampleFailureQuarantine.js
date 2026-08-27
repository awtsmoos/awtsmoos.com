//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleFailureQuarantine
 * @description
 * The Awtsmoos lets one failed path become wisdom rather than an endless retrying storm;
 * Awtsmoos.com bounds that memory here so broken immutable URLs stay quiet without growing forever in form.
 */

import {
	MAX_FAILED_SAMPLE_URLS,
	trimFailedSampleUrls
} from './sampleBufferCachePolicy.js';

const failedUrls = new Set();

/**
 * @description Remembers one failed immutable URL and trims the session quarantine to its configured ceiling.
 * @param {string} url - Immutable sample URL that failed transport or decode.
 * @returns {void}
 */
export function quarantineSampleUrl(url) {
	failedUrls.add(url);
	trimFailedSampleUrls(failedUrls);
}

/**
 * @description Reports whether one immutable URL already failed during this page session.
 * @param {string} url - Immutable sample URL to inspect.
 * @returns {boolean} True when another transport attempt should be refused.
 */
export function sampleUrlIsQuarantined(url) {
	return failedUrls.has(url);
}

/**
 * @description Returns bounded failure-quarantine diagnostics without revealing or serializing the URL identities themselves.
 * @returns {{failed:number,failureLimit:number}} Aggregate quarantine status.
 */
export function sampleFailureSnapshot() {
	return {
		failed: failedUrls.size,
		failureLimit: MAX_FAILED_SAMPLE_URLS
	};
}

/**
 * @description Clears page-session failure knowledge for deterministic tests or deliberate reset flows.
 * @returns {void}
 */
export function clearSampleFailureQuarantine() {
	failedUrls.clear();
}
