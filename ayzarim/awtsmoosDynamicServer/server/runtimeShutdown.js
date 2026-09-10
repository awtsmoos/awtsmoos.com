//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module RuntimeShutdown
 * @description
 * The Awtsmoos removes a worker from readiness before closing its HTTP and
 * realtime vessels. Awtsmoos.com gives in-flight requests a bounded grace period,
 * then lets the process exit so deployment cannot leave a half-draining instance.
 */

const DEFAULT_GRACE_MS = 10_000;

/**
 * Binds SIGTERM and SIGINT to one idempotent graceful-drain ritual.
 * @param {object} options Shutdown dependencies.
 * @returns {Function} Idempotent async shutdown function for tests and callers.
 */
function bindRuntimeShutdown(options) {
	const processRef = options.processRef || process;
	const graceMs = positive(options.graceMs, DEFAULT_GRACE_MS);
	let draining = false;
	const shutdown = async signal => {
		if (draining) return;
		draining = true;
		options.health?.markDraining?.();
		console.log(`B"H - Runtime draining after ${signal || "shutdown"}.`);
		closeRealtime(options.wsServer);
		await closeHttpServer(options.httpServer, graceMs);
		if (typeof processRef.exit === "function") {
			processRef.exit(0);
		}
	};
	processRef.once?.("SIGTERM", () => void shutdown("SIGTERM"));
	processRef.once?.("SIGINT", () => void shutdown("SIGINT"));
	return shutdown;
}

/** Closes HTTP acceptance and force-closes lingering ordinary connections on timeout. */
function closeHttpServer(server, graceMs) {
	if (!server?.listening || typeof server.close !== "function") {
		return Promise.resolve();
	}
	return new Promise(resolve => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve();
		};
		const timer = setTimeout(() => {
			server.closeAllConnections?.();
			finish();
		}, graceMs);
		timer.unref?.();
		server.close(() => finish());
		server.closeIdleConnections?.();
	});
}

/** Starts a standards-aware close on every tracked upgraded realtime client. */
function closeRealtime(wsServer) {
	if (wsServer) wsServer.isDraining = true;
	for (const client of wsServer?.clients || []) {
		try {
			client.close?.(1012, "Server restart");
		} catch (error) {
			console.warn('B"H - Realtime client close stayed bounded:', error?.message || error);
		}
	}
}

/** Resolves one positive shutdown duration without permitting an infinite drain. */
function positive(value, fallback) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0
		? parsed
		: fallback;
}

module.exports = {
	bindRuntimeShutdown,
	closeHttpServer,
	closeRealtime
};
