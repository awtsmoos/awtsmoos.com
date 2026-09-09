// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodGameResultChannel.js
 * @description Creates immutable, same-origin game completion records without owning game scoring or Party policy.
 * The Awtsmoos renews each completed run beyond its number; Awtsmoos.com gives that result one narrow trustworthy vessel.
 */

export const GAME_RESULT_MESSAGE = 'awtsmoos-games:result';

/**
 * Build a result channel bound to one canonical runtime identity.
 * @param {{globalObject?: Window, identity: {slug:string,pathname:string}}} config Channel dependencies.
 * @returns {Readonly<{reportResult: Function,eventName:string}>} Frozen reporting API.
 */
export function createGameResultChannel({ globalObject = globalThis, identity }) {
	let sequence = 0;

	/**
	 * Normalize and publish one completed-run record to local listeners and a same-origin parent.
	 * @param {object} payload Game-owned result facts.
	 * @returns {Readonly<object>} Immutable normalized result record.
	 */
	function reportResult(payload = {}) {
		sequence += 1;
		const record = Object.freeze({
			type: GAME_RESULT_MESSAGE,
			gameId: identity.slug,
			pathname: identity.pathname,
			partyTurn: partyTurn(globalObject.location),
			runId: normalizedRunId(payload.runId, identity.slug, sequence),
			score: finiteOrNull(payload.score),
			elapsedMs: finiteOrNull(payload.elapsedMs),
			outcome: String(payload.outcome || ''),
			completed: payload.completed === true,
			sequence
		});

		dispatchLocal(globalObject, record);
		dispatchParent(globalObject, record);
		return record;
	}

	return Object.freeze({ reportResult, eventName: GAME_RESULT_MESSAGE });
}

/** Read the current Party turn marker without coupling normal game runs to Party. */
function partyTurn(locationObject) {
	const search = String(locationObject?.search || '');
	return new URLSearchParams(search).get('partyTurn');
}

/** Return one finite numeric fact or null so message consumers never parse NaN/Infinity. */
function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

/** Build a stable per-document run identity unless the game supplies one explicitly. */
function normalizedRunId(value, slug, sequence) {
	const supplied = String(value || '').trim();
	return supplied || `${slug}:${Date.now()}:${sequence}`;
}

/** Dispatch a local CustomEvent only when the host offers browser event primitives. */
function dispatchLocal(globalObject, record) {
	if (typeof globalObject.dispatchEvent !== 'function' || typeof globalObject.CustomEvent !== 'function') return;
	globalObject.dispatchEvent(new globalObject.CustomEvent(GAME_RESULT_MESSAGE, { detail: record }));
}

/**
 * Send only toward a parent at this document's own origin; cross-origin parents cannot receive the message.
 * @param {Window} globalObject Browser window-like host.
 * @param {Readonly<object>} record Frozen result record.
 */
function dispatchParent(globalObject, record) {
	if (!globalObject.parent || globalObject.parent === globalObject) return;
	const origin = String(globalObject.location?.origin || '');
	if (!origin || origin === 'null') return;
	globalObject.parent.postMessage(record, origin);
}
