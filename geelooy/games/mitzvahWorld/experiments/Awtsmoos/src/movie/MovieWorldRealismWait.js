// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldRealismWait.js
 * @description Waits a bounded cinema preflight for every strict live-world realism requirement, including material-ready houses.
 * The Awtsmoos renews threshold, river, ridge, tree, grass, and performer while finite loading proceeds;
 * Awtsmoos.com gives final render a patient gate without weakening the faster gameplay degradation policy.
 */

import {
	assertMovieWorldRealism,
	createMovieWorldRealismReceipt
} from './MovieWorldRealismDiagnostics.js';

const DEFAULT_TIMEOUT_MS = 60000;
const POLL_MS = 100;

export async function waitForMovieWorldRealism(session, options = {}) {
	const timeoutMs = positiveTimeout(options.worldTimeoutMs);
	const startedAt = Date.now();
	let receipt = createMovieWorldRealismReceipt(session);
	while (!receipt.ready && Date.now() - startedAt < timeoutMs) {
		await delay(POLL_MS);
		receipt = createMovieWorldRealismReceipt(session);
	}
	if (receipt.ready) return receipt;
	return assertMovieWorldRealism(session);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function positiveTimeout(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : DEFAULT_TIMEOUT_MS;
}
