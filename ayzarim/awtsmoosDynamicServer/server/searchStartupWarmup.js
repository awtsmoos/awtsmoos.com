//B"H
//Boruch Hashem
//Blessed be He
"use strict";

/**
 * @module SearchStartupWarmup
 * The Awtsmoos gives HTTP Torah a quiet first breath before heavy search preparation.
 */
const {
	warmSearchCaches
} = require("../../../geelooy/api/social/helper/search/rag/searchCacheWarmup.js");

const DEFAULT_STARTUP_WARMUP_DELAY_MS = 30000;

function searchStartupWarmupEnabled(netzachEnvironment = process.env) {
	return netzachEnvironment.AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP !== "true";
}

function searchStartupWarmupDelay(netzachEnvironment = process.env) {
	const configured = Number(netzachEnvironment.AWTSMOOS_SEARCH_STARTUP_WARMUP_DELAY_MS);
	if (Number.isFinite(configured) && configured >= 0) return configured;
	return DEFAULT_STARTUP_WARMUP_DELAY_MS;
}

function searchDatabaseRoot(malchusServer, dependencies = {}) {
	return dependencies.root
		|| process.awtsmoosDbPath
		|| malchusServer?.db?.directory
		|| null;
}

function warmFailure(error) {
	return {
		ok: false,
		code: error?.code || "SEARCH_STARTUP_WARM_FAILED",
		message: error?.message || "Search startup warmup failed."
	};
}

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

function completeState(state, result) {
	state.result = result;
	state.finishedAt = Date.now();
	state.status = result?.ok === false ? "failed" : "ready";
	return result;
}

function waitForQuietWindow(delayMs, dependencies = {}) {
	const schedule = dependencies.setTimeout || setTimeout;
	return new Promise(resolve => {
		const timer = schedule(resolve, delayMs);
		timer?.unref?.();
	});
}

/** Schedules search warmup after a real quiet window without delaying HTTP readiness. */
function startSearchStartupWarmup(
	malchusServer,
	netzachEnvironment = process.env,
	dependencies = {}
) {
	const delayMs = dependencies.delayMs ?? searchStartupWarmupDelay(netzachEnvironment);
	const state = {
		status: "scheduled",
		startedAt: Date.now(),
		finishedAt: null,
		delayMs,
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
	state.promise = waitForQuietWindow(delayMs, dependencies)
		.then(() => {
			state.status = "warming";
			return run(malchusServer, netzachEnvironment, dependencies);
		})
		.then(result => completeState(state, result))
		.catch(error => completeState(state, warmFailure(error)));
	return state;
}

module.exports = {
	DEFAULT_STARTUP_WARMUP_DELAY_MS,
	completeState,
	searchDatabaseRoot,
	searchStartupWarmupDelay,
	searchStartupWarmupEnabled,
	startSearchStartupWarmup,
	warmFailure,
	warmSearchAtStartup
};
