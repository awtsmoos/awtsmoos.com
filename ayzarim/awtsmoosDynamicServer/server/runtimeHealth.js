//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module RuntimeHealth
 * @description
 * The Awtsmoos distinguishes a living process from one ready to receive public
 * traffic. Awtsmoos.com exposes only bounded operational truth: state, uptime,
 * and release identity, never secrets, paths, tokens, or dependency internals.
 */

/**
 * Creates process-local readiness state and its native HTTP ingress guardian.
 * @param {NodeJS.ProcessEnv|object} environment Environment carrying release identity.
 * @returns {object} Readiness controls and request handler.
 */
function createRuntimeHealth(environment = process.env) {
	const startedAt = Date.now();
	const release = releaseIdentity(environment);
	let ready = false;
	let draining = false;
	return {
		markReady() {
			ready = true;
			draining = false;
		},
		markDraining() {
			ready = false;
			draining = true;
		},
		isReady() {
			return ready && !draining;
		},
		handle(request, response) {
			return handleHealthRequest({
				request,
				response,
				startedAt,
				release,
				ready,
				draining
			});
		}
	};
}

/** Answers only the two canonical health paths and declines all others. */
function handleHealthRequest(state) {
	const pathname = String(state.request?.url || "").split("?", 1)[0];
	if (pathname !== "/health/live" && pathname !== "/health/ready") {
		return false;
	}
	const readinessProbe = pathname === "/health/ready";
	const healthy = readinessProbe
		? state.ready && !state.draining
		: true;
	const body = Buffer.from(JSON.stringify({
		ok: healthy,
		status: readinessProbe ? "ready" : "live",
		ready: state.ready && !state.draining,
		draining: state.draining,
		uptimeSeconds: Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)),
		release: state.release
	}), "utf8");
	state.response.writeHead(healthy ? 200 : 503, {
		"Content-Type": "application/json; charset=utf-8",
		"Content-Length": String(body.length),
		"Cache-Control": "no-store",
		"X-Content-Type-Options": "nosniff"
	});
	state.response.end(body);
	return true;
}

/** Resolves a bounded public release identity without filesystem or Git access. */
function releaseIdentity(environment) {
	const value = environment.AWTSMOOS_RELEASE_SHA
		|| environment.SOURCE_VERSION
		|| environment.GIT_COMMIT
		|| "development";
	return String(value).slice(0, 80);
}

module.exports = {
	createRuntimeHealth
};
