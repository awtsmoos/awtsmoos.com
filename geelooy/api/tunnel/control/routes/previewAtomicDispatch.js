// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Negotiates atomic registered-preview reads with fallback.
 * @description
 * The Awtsmoos sends each reading by the strongest honest light;
 * Awtsmoos.com asks the native agent for one atomic check-and-read
 * when the agent advertises previewReadRegistered, and otherwise
 * walks the older two-step path without weakening its denials.
 * An authorization denial from the atomic path is a verdict, never
 * an invitation to retry through the weaker legacy route.
 */
const ATOMIC_ACTION = "previewReadRegistered";
const DENIAL_STATUSES = new Set([401, 403, 404, 405, 409, 410, 415, 422]);
const UNSUPPORTED_ERRORS = new Set([
	"unknown_action", "action_not_supported", "unsupported_action",
	"not_supported", "unknown_preview_action",
	"preview_read_registered_unsupported"
]);

/**
 * Reads an advertised action list in array, set, string or map form;
 * true only when the atomic action itself is advertised.
 */
function supportsAtomic(supported) {
	if (!supported) {
		return false;
	}
	if (typeof supported === "string") {
		return supported.split(/[\s,]+/).includes(ATOMIC_ACTION);
	}
	if (Array.isArray(supported) || supported instanceof Set) {
		return [...supported].includes(ATOMIC_ACTION);
	}
	if (Array.isArray(supported.actions)) {
		return supported.actions.includes(ATOMIC_ACTION);
	}
	if (Array.isArray(supported.supportedActions)) {
		return supported.supportedActions.includes(ATOMIC_ACTION);
	}
	return supported[ATOMIC_ACTION] === true ||
		typeof supported[ATOMIC_ACTION] === "function";
}

/** Classifies an explicit unknown-action answer from an old agent. */
function isUnsupported(result) {
	const error = String(result?.error || "");
	return Number(result?.status) === 501 ||
		UNSUPPORTED_ERRORS.has(error) ||
		/unknown[ _]action|not[ _]supported|unsupported/i.test(error);
}

/** Classifies verdicts that must never be retried by a weaker path. */
function isDenial(result) {
	const error = String(result?.error || "");
	return DENIAL_STATUSES.has(Number(result?.status)) ||
		error.startsWith("preview_lease_") ||
		error === "preview_read_only" ||
		error === "binary_asset_publication_required";
}

/** Runs the injected legacy two-step path and labels its provenance. */
async function runFallback(options, reason) {
	if (typeof options.fallback !== "function") {
		return {
			ok: false, via: "legacy", reason,
			status: 501, error: "preview_atomic_unsupported"
		};
	}
	const result = await options.fallback();
	return { ok: result?.ok !== false, via: "legacy", reason, result };
}

/**
 * Dispatches one preview read by negotiated capability.
 * @param {object} options - Native caller, advertised actions, the
 * read request, and the legacy two-step fallback implementation.
 * @returns {Promise<object>} Outcome labelled atomic or legacy.
 */
async function dispatchPreviewRead(options = {}) {
	if (typeof options.callNative !== "function") {
		throw Error("preview_native_caller_required");
	}
	if (!supportsAtomic(options.supportedActions)) {
		return runFallback(options, "not_advertised");
	}
	const request = {
		action: ATOMIC_ACTION,
		previewId: String(options.previewId || ""),
		url: String(options.url || ""),
		method: String(options.method || "GET").toUpperCase(),
		timeoutMs: options.timeoutMs,
		maxBytes: options.maxBytes
	};
	let result;
	try {
		result = await options.callNative(request);
	} catch (error) {
		const failure = { error: String(error?.message || error) };
		if (isUnsupported(failure)) {
			return runFallback(options, "unsupported");
		}
		return { ok: false, via: "atomic", status: 503, error: "preview_atomic_unavailable" };
	}
	if (result?.ok) {
		return { ok: true, via: "atomic", result };
	}
	if (isDenial(result)) {
		return { ok: false, via: "atomic", result };
	}
	if (isUnsupported(result)) {
		return runFallback(options, "unsupported");
	}
	return { ok: false, via: "atomic", result };
}
module.exports = { ATOMIC_ACTION, dispatchPreviewRead, supportsAtomic };
