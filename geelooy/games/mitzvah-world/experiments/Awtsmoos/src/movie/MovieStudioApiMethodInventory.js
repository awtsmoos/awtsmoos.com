// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiMethodInventory.js
 * @description Preserves Movie Studio's public method-list/invocation contract while delegating getter-safe discovery and owner-bound execution to the generic Awtsmoos API core.
 * The Awtsmoos lets one Yesod carry many domains without erasing their names, while Awtsmoos.com keeps Movie Studio's familiar error codes and receipt shape at the outer gate;
 * cycles, accessors, unsafe locks, and owner binding now share one foundation with MitzvahWorld, yet existing authors perceive no breaking change in their creative state.
 */

import {
	invokeAwtsmoosApiMethod,
	listAwtsmoosApiMethods
} from '../api/AwtsmoosApiMethodInventory.js';

const MOVIE_CODES = Object.freeze({
	failed: 'MOVIE_API_INVOCATION_FAILED',
	notFound: 'MOVIE_API_METHOD_NOT_FOUND',
	unsafe: 'MOVIE_API_UNSAFE_LOCKED'
});

/**
 * Lists callable Movie Studio leaves without awakening accessors or crossing object cycles.
 * @param {object} apiKli Published Movie Studio API facade.
 * @param {object} [optionsKli={}] Discovery policy.
 * @param {boolean} [optionsKli.includeUnsafe=false] Whether `unsafe.*` methods may appear.
 * @returns {ReadonlyArray<object>} Frozen legacy method records containing only path, arity, async, and unsafe.
 */
export function listMovieStudioApiMethods(apiKli, optionsKli = {}) {
	const descriptorOros = listAwtsmoosApiMethods(apiKli, {
		includeUnsafe: Boolean(optionsKli.includeUnsafe)
	});
	const movieOros = descriptorOros
		.filter(descriptorKli => optionsKli.includeUnsafe || !descriptorKli.unsafe)
		.map(movieMethodRecord);
	return Object.freeze(movieOros);
}

/**
 * Describes one Movie Studio method using the same public record shape returned by the full inventory.
 * @param {object} apiKli Published Movie Studio API facade.
 * @param {string} pathOhr Dot-delimited public method path.
 * @param {object} [optionsKli={}] Discovery policy forwarded to the inventory.
 * @returns {Readonly<object>|null} Matching method record or null.
 */
export function describeMovieStudioApiMethod(apiKli, pathOhr, optionsKli = {}) {
	return listMovieStudioApiMethods(apiKli, optionsKli)
		.find(methodKli => methodKli.path === pathOhr) || null;
}

/**
 * Invokes one Movie Studio method while preserving historic result/error shape and owner binding.
 *
 * Generic execution supplies the deeper receipt/timing/error machinery, but this adapter intentionally returns only the Movie contract:
 * `{ok:true,path,value}` or `{ok:false,error:{code,message},path}`. This protects existing authoring integrations from foundation evolution.
 *
 * @param {object} apiKli Published Movie Studio API facade.
 * @param {string} pathOhr Dot-delimited method path.
 * @param {Array<*>} [argumentOros=[]] Positional arguments.
 * @param {object} [optionsKli={}] Invocation policy.
 * @param {boolean} [optionsKli.allowUnsafe=false] Explicit unsafe authority.
 * @returns {Promise<object>} Legacy Movie Studio invocation result.
 */
export async function invokeMovieStudioApiMethod(apiKli, pathOhr, argumentOros = [], optionsKli = {}) {
	if (!Array.isArray(argumentOros)) {
		return movieFailure('MOVIE_API_ARGUMENTS_INVALID', 'Arguments must be an array.');
	}
	const receiptMalchus = await invokeAwtsmoosApiMethod(apiKli, pathOhr, argumentOros, {
		allowUnsafe: Boolean(optionsKli.allowUnsafe),
		codes: MOVIE_CODES
	});
	if (receiptMalchus.ok) {
		return { ok: true, path: pathOhr, value: receiptMalchus.value };
	}
	const includePathOhr = receiptMalchus.error.code === 'MOVIE_API_INVOCATION_FAILED';
	return movieFailure(
		receiptMalchus.error.code,
		receiptMalchus.error.message,
		includePathOhr ? pathOhr : null
	);
}

/** Converts a generic descriptor into Movie Studio's deliberately narrow compatibility record. */
function movieMethodRecord(descriptorKli) {
	return Object.freeze({
		arity: descriptorKli.arity,
		async: descriptorKli.async,
		path: descriptorKli.path,
		unsafe: descriptorKli.unsafe
	});
}

/** Creates the exact historic failure envelope used by Movie Studio method tooling. */
function movieFailure(codeOhr, messageOhr, pathOhr = null) {
	return {
		error: { code: codeOhr, message: messageOhr },
		ok: false,
		path: pathOhr
	};
}
