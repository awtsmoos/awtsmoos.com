//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module SearchStartupWarmup
 * @description
 * The Awtsmoos schedules cold search preparation without binding HTTP readiness;
 * Awtsmoos.com keeps one observable state vessel so success, timeout, or failure
 * can be inspected without unhandled rejection or hidden startup delay.
 */

const {
	warmSearchCaches
} = require("../../../geelooy/api/social/helper/search/rag/searchCacheWarmup.js");

/** Returns false only when this worker explicitly relinquishes search prewarming. */
function searchStartupWarmupEnabled(netzachEnvironment = process.env) {
	return netzachEnvironment.AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP !== "true";
}

/** Resolves the initialized database root without guessing another storage vessel. */
function searchDatabaseRoot(malchusServer, dependencies = {}) {
	return dependencies.root
		|| process.awtsmoosDbPath
		|| malchusServer?.db?.directory
		|| null;
}

/** Converts one unexpected warm failure into compact non-fatal testimony. */
function warmFailure(error) {
	return {
		ok: false,
		code: error?.code || "SEARCH_STARTUP_WARM_FAILED",
		message: error?.message || "Search startup warmup failed."
	};
}

/** Runs the worker-isolated catalog warm operation for direct callers/tests. */
async function warmSearchAtStartup(
	malchusServer,
	netzachEnvironment = process.env,
	dependencies = {}
) {
	if (!searchStartupWarmupEnabled(netzachEnvironment)) {
		return { ok: true, skipped: true, reason: "disabled" };
	}
	const root = searchDatabaseRoot(malchusServer, dependencies);
	if (!root) return { ok: false, code: "SEARCH_DB_ROOT_UNAVAILABLE" };
	const warmCaches = dependencies.warmSearchCaches || warmSearchCaches;
	try {
		return {
			...(await warmCaches({ db: { directory: root } })),
			root
		};
	} catch (error) {
		return warmFailure(error);
	}
}

/** Applies completion testimony without replacing the observable state object. */
function completeState(state, result) {
	state.result = result;
	state.finishedAt = Date.now();
	state.status = result?.ok === false ? "failed" : "ready";
	return result;
}

/**
 * Starts warmup without awaiting it. The contained promise always resolves to
 * compact testimony, so startup can never inherit an unhandled worker rejection.
 */
function startSearchStartupWarmup(
	malchusServer,
	netzachEnvironment = process.env,
	dependencies = {}
) {
	const state = {
		status: "scheduled",
		startedAt: Date.now(),
		finishedAt: null,
		result: null,
		promise: null
	};
	if (!searchStartupWarmupEnabled(netzachEnvironment)) {
		const disabled = { ok: true, skipped: true, reason: "disabled" };
		state.status = "disabled";
		state.finishedAt = Date.now();
		state.result = disabled;
		state.promise = Promise.resolve(disabled);
		return state;
	}
	const run = dependencies.warmSearchAtStartup || warmSearchAtStartup;
	state.promise = Promise.resolve()
		.then(() => {
			state.status = "warming";
			return run(malchusServer, netzachEnvironment, dependencies);
		})
		.then(result => completeState(state, result))
		.catch(error => completeState(state, warmFailure(error)));
	return state;
}

module.exports = {
	completeState,
	searchDatabaseRoot,
	searchStartupWarmupEnabled,
	startSearchStartupWarmup,
	warmFailure,
	warmSearchAtStartup
};
