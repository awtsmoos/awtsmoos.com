// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file boundedInteractionActions.js
 * @description
 * The Awtsmoos renews each browser moment without letting one probe swallow the hour;
 * Awtsmoos.com gives every selector and slim evaluation a measured, truthful power.
 */

const ChromeActions = require("./actions.js");

const DEFAULT_WAIT_TIMEOUT_MS = 10000;
const DEFAULT_PROBE_TIMEOUT_MS = 750;
const MAX_PROBE_TIMEOUT_MS = 1000;
const DEFAULT_SLIM_TIMEOUT_MS = 2500;
const POLL_INTERVAL_MS = 100;

/** Returns one positive numeric parameter while preserving nested Chrome payload semantics. */
function positiveParam(payload, key, fallback) {
	const value = Number(ChromeActions.param(payload, key, fallback));
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Creates one legacy-eval payload whose inner CDP call cannot exceed this probe budget. */
function evalPayload(payload, expression, timeoutMs) {
	return {
		...payload,
		action: "chromeEval",
		expression,
		timeoutMs,
		params: {
			...(payload.params || {}),
			expression,
			timeoutMs
		}
	};
}

/** Runs the existing Chrome evaluator through a deliberately smaller timeout vessel. */
async function chromeEvalSlim(payload = {}) {
	const requested = positiveParam(payload, "timeoutMs", DEFAULT_SLIM_TIMEOUT_MS);
	const ceiling = positiveParam(payload, "slimTimeoutMs", DEFAULT_SLIM_TIMEOUT_MS);
	const timeoutMs = Math.min(requested, ceiling);
	const expression = ChromeActions.expressionOf(payload);
	return ChromeActions.chromeEval(evalPayload(payload, expression, timeoutMs));
}

/**
 * Waits for a selector while ensuring no individual CDP probe can consume the outer deadline.
 * @param {object} payload Chrome action payload containing selector and optional timeout values.
 * @returns {Promise<object>} Existing wait-for-selector response shape with bounded probe evidence.
 */
async function chromeWaitForSelector(payload = {}) {
	const selector = String(ChromeActions.param(payload, "selector", ""));
	if (!selector) {
		return {
			ok: false,
			action: "chromeWaitForSelector",
			error: "missing_selector"
		};
	}

	const timeout = positiveParam(payload, "timeoutMs", DEFAULT_WAIT_TIMEOUT_MS);
	const requestedProbe = positiveParam(payload, "probeTimeoutMs", DEFAULT_PROBE_TIMEOUT_MS);
	const probeCeiling = Math.min(requestedProbe, MAX_PROBE_TIMEOUT_MS);
	const startedAt = Date.now();
	let lastProbe = null;

	while (Date.now() - startedAt < timeout) {
		const elapsed = Date.now() - startedAt;
		const remaining = Math.max(1, timeout - elapsed);
		const probeTimeout = Math.min(remaining, probeCeiling);
		const expression = `!!document.querySelector(${JSON.stringify(selector)})`;
		lastProbe = await ChromeActions.chromeEval(evalPayload(payload, expression, probeTimeout));

		if (lastProbe.ok && lastProbe.value === true) {
			return {
				ok: true,
				action: "chromeWaitForSelector",
				selector,
				found: true,
				durationMs: Date.now() - startedAt
			};
		}

		const afterProbe = Date.now() - startedAt;
		if (afterProbe >= timeout) {
			break;
		}

		await new Promise(resolve => {
			setTimeout(resolve, Math.min(POLL_INTERVAL_MS, timeout - afterProbe));
		});
	}

	return {
		ok: false,
		action: "chromeWaitForSelector",
		selector,
		found: false,
		timeout,
		lastProbeError: lastProbe?.ok === false ? lastProbe.error : undefined,
		logs: lastProbe?.logs || []
	};
}

module.exports = {
	chromeEvalSlim,
	chromeWaitForSelector,
	positiveParam
};
