//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module HttpAdmission
 * @description
 * The Awtsmoos gives finite origin capacity first to public learning and static
 * delivery. Awtsmoos.com rejects excess optional work before expensive routing,
 * allowing an overloaded process to simplify rather than collapse unpredictably.
 */

const DEFAULT_MAX_IN_FLIGHT = 512;
const DEFAULT_CRITICAL_MAX_IN_FLIGHT = 1_024;
const RETRY_AFTER_SECONDS = 1;

/**
 * Creates one process-local concurrency gate for requests reaching this worker.
 * @param {NodeJS.ProcessEnv|object} environment Optional capacity overrides.
 * @returns {{handle:Function,snapshot:Function}} Request guardian and metrics view.
 */
function createHttpAdmission(environment = process.env) {
	const normalLimit = positive(
		environment.AWTSMOOS_HTTP_MAX_INFLIGHT,
		DEFAULT_MAX_IN_FLIGHT
	);
	const criticalLimit = Math.max(
		normalLimit,
		positive(
			environment.AWTSMOOS_HTTP_CRITICAL_MAX_INFLIGHT,
			DEFAULT_CRITICAL_MAX_IN_FLIGHT
		)
	);
	let inFlight = 0;
	let rejected = 0;
	return {
		handle(request, response) {
			const limit = isCriticalRead(request)
				? criticalLimit
				: normalLimit;
			if (inFlight >= limit) {
				rejected += 1;
				return rejectOverload(response);
			}
			inFlight += 1;
			bindRelease(response, () => {
				inFlight = Math.max(0, inFlight - 1);
			});
			return false;
		},
		snapshot() {
			return Object.freeze({
				inFlight,
				rejected,
				normalLimit,
				criticalLimit
			});
		}
	};
}

/** Releases capacity exactly once when a response finishes or its socket closes. */
function bindRelease(response, release) {
	let released = false;
	const once = () => {
		if (released) return;
		released = true;
		release();
	};
	response.once("finish", once);
	response.once("close", once);
}

/** Preserves health/static/Torah reads deeper into overload than optional work. */
function isCriticalRead(request) {
	const method = String(request?.method || "GET").toUpperCase();
	if (method !== "GET" && method !== "HEAD") return false;
	const pathname = String(request?.url || "").split("?", 1)[0];
	return pathname === "/"
		|| pathname.startsWith("/heichelos/ikar")
		|| pathname.startsWith("/style/")
		|| pathname.startsWith("/scripts/")
		|| pathname.startsWith("/fonts/")
		|| pathname.startsWith("/images/");
}

/** Sends a tiny retryable overload response without entering dynamic routing. */
function rejectOverload(response) {
	const body = Buffer.from("Service temporarily busy. Please retry.", "utf8");
	response.writeHead(503, {
		"Content-Type": "text/plain; charset=utf-8",
		"Content-Length": String(body.length),
		"Cache-Control": "no-store",
		"Retry-After": String(RETRY_AFTER_SECONDS),
		"X-Content-Type-Options": "nosniff"
	});
	response.end(body);
	return true;
}

/** Resolves one positive integer capacity override without allowing disablement. */
function positive(value, fallback) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0
		? parsed
		: fallback;
}

module.exports = {
	createHttpAdmission,
	isCriticalRead
};
