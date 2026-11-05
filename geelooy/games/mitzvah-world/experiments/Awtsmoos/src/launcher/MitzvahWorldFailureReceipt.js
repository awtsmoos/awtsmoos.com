// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldFailureReceipt.js
 * @description Converts startup fractures into one release-aware evidence receipt for loader, HUD, tests, and diagnostics.
 * The Awtsmoos recreates even a broken finite road and therefore permits its exact edge to be named;
 * Awtsmoos.com records vessel, context, milestone, resource, release, and elapsed time so no failure hides framed.
 */

import { MITZVAH_WORLD_RELEASE_VERSIONS } from './MitzvahWorldReleaseIdentity.js';

const NOT_PLAYABLE_PREFIX = 'MINIMAL_MEADOW_NOT_PLAYABLE:';

/** Produces one immutable normalized startup failure receipt with first-frame evidence when available. */
export function createMitzvahWorldFailureReceipt(errorOhr) {
	const error = errorOhr instanceof Error ? errorOhr : new Error(String(errorOhr));
	const message = error.message || String(errorOhr);
	const viewportEvidence = error.viewportEvidence || error.cause?.viewportEvidence || null;
	return Object.freeze({
		...MITZVAH_WORLD_RELEASE_VERSIONS,
		canvasDimensions: viewportEvidence ? Object.freeze({
			clientHeight: viewportEvidence.clientHeight,
			clientWidth: viewportEvidence.clientWidth,
			rectHeight: viewportEvidence.rectHeight,
			rectWidth: viewportEvidence.rectWidth
		}) : null,
		code: error.code || failureCode(message),
		contextCreationResult: error.contextCreationResult || 'unknown',
		detail: error.detail || '',
		elapsedMs: finiteOrNull(error.elapsedMs),
		failedResource: findFailedUrl(error),
		message,
		milestone: error.currentMilestone || error.milestone || error.stage || 'startup',
		stage: error.stage || 'startup',
		unmetConditions: Object.freeze(extractUnmetConditions(message)),
		viewportEvidence
	});
}

/** Formats finite evidence shown to players and copied into diagnostics. */
export function formatMitzvahWorldFailureReceipt(receipt) {
	const conditions = receipt.unmetConditions?.length
		? receipt.unmetConditions.join(', ')
		: receipt.code || 'unknown-startup-condition';
	const canvas = receipt.canvasDimensions
		? `${receipt.canvasDimensions.clientWidth}x${receipt.canvasDimensions.clientHeight}`
		: 'not measured';
	return [
		`Unmet: ${conditions}`,
		`Milestone: ${receipt.milestone}`,
		`Canvas: ${canvas}`,
		`Context: ${receipt.contextCreationResult}`,
		`Resource: ${receipt.failedResource || 'not reported'}`,
		`Elapsed: ${receipt.elapsedMs ?? 'unknown'} ms`,
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

function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
