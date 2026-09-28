//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldFailureReceipt.js
 * @description Converts startup fractures into one compact release-aware failure receipt for loader, HUD, tests, and diagnostics.
 * The Awtsmoos recreates even the broken finite road and therefore permits its exact edge to be named;
 * Awtsmoos.com records condition, URL, source, bundle, and release together so recovery never hides behind a vague failure framed.
 */

import { MITZVAH_WORLD_RELEASE_VERSIONS } from './MitzvahWorldReleaseIdentity.js';

const NOT_PLAYABLE_PREFIX = 'MINIMAL_MEADOW_NOT_PLAYABLE:';

/** Produces one immutable normalized startup failure receipt. */
export function createMitzvahWorldFailureReceipt(errorOhr) {
	const error = errorOhr instanceof Error ? errorOhr : new Error(String(errorOhr));
	const message = error.message || String(errorOhr);
	const unmetConditions = extractUnmetConditions(message);
	return Object.freeze({
		...MITZVAH_WORLD_RELEASE_VERSIONS,
		code: error.code || failureCode(message),
		detail: error.detail || '',
		failedUrl: findFailedUrl(error),
		message,
		stage: error.stage || 'startup',
		unmetConditions: Object.freeze(unmetConditions)
	});
}

/** Formats the exact finite evidence shown to players and copied into diagnostics. */
export function formatMitzvahWorldFailureReceipt(receipt) {
	const conditions = receipt.unmetConditions?.length
		? receipt.unmetConditions.join(', ')
		: receipt.code || 'unknown-startup-condition';
	const url = receipt.failedUrl || 'not reported';
	return [
		`Unmet: ${conditions}`,
		`URL: ${url}`,
		`Release: ${receipt.releaseId}`,
		`Source: ${receipt.sourceVersion} · Bundle: ${receipt.bundleVersion}`
	].join('\n');
}

function extractUnmetConditions(message) {
	if (!message.startsWith(NOT_PLAYABLE_PREFIX)) return [];
	return message.slice(NOT_PLAYABLE_PREFIX.length)
		.split(',')
		.map(value => value.trim())
		.filter(Boolean);
}

function failureCode(message) {
	return message.startsWith(NOT_PLAYABLE_PREFIX)
		? 'MITZVAH_WORLD_NOT_PLAYABLE'
		: 'MITZVAH_WORLD_STARTUP_FAILED';
}

function findFailedUrl(error) {
	for (const key of ['failedUrl', 'url', 'requestUrl', 'resourceUrl']) {
		if (typeof error?.[key] === 'string' && error[key]) return error[key];
	}
	const cause = error?.cause;
	for (const key of ['failedUrl', 'url', 'requestUrl', 'resourceUrl']) {
		if (typeof cause?.[key] === 'string' && cause[key]) return cause[key];
	}
	return '';
}
