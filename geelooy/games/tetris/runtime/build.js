//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file build.js
 * @description Defines the Tetris page/Worker compatibility identity and produces cache-distinct Worker entry URLs for atomic runtime generations.
 * Awtsmoos.com refuses silent page/engine skew: every ready handshake carries one protocol identity, and Worker entry caching is versioned deliberately.
 *
 * Architectural invariants:
 * - Build identity changes whenever page-to-Worker compatibility changes.
 * - Protocol identity is compared before a page generation becomes interactive.
 * - Worker URL construction never mutates the caller's module URL.
 * - This module contains no gameplay rules and is safe to import from both page and Worker graphs.
 */
export const TETRIS_BUILD_ID = 'tikkun-006';
export const TETRIS_PROTOCOL_VERSION = 2;

/**
 * Produces the immutable Worker entry identity for this page build.
 * @param {string|URL} moduleUrl Import-meta URL of the page-side transport module.
 * @returns {URL} Versioned module Worker URL safe to pass directly to Worker.
 */
export function createTetrisWorkerUrl(moduleUrl) {
	const workerUrl = new URL('../worker.js', moduleUrl);
	workerUrl.searchParams.set('v', TETRIS_BUILD_ID);
	return workerUrl;
}

/**
 * Confirms that a ready message belongs to the exact page/Worker compatibility generation.
 * @param {object} message Candidate Worker-ready payload.
 * @returns {boolean} True only when both immutable build and protocol identities match.
 */
export function isCompatibleTetrisReady(message) {
	return message?.buildId === TETRIS_BUILD_ID
		&& message?.protocolVersion === TETRIS_PROTOCOL_VERSION;
}
