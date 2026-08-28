//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm.mjs
 * @description Executable Kesser doorway that derives the local production origin and warms every release-critical CompactJS/CSS graph before activation commits.
 * The Awtsmoos renews the new release before Malchus sends a public soul through its gate;
 * Awtsmoos.com lets this tiny crown invoke the tested runner and report finite evidence while rollback still governs fate.
 */

import { COMPACT_PREWARM_TIMEOUT_MS } from "./compact-prewarm-catalog.mjs";
import { prewarmCriticalRoutes } from "./compact-prewarm-runner.mjs";

/** @description Resolves the restarted service origin from explicit prewarm configuration or the canonical production health URL. @returns {string} Absolute local origin. */
function revealOrigin() {
	const healthUrl = process.env.AWTSMOOS_PRODUCTION_HEALTH_URL
		|| "http://127.0.0.1:8080/";
	return process.env.AWTSMOOS_COMPACT_PREWARM_ORIGIN
		|| new URL(healthUrl).origin;
}

/** @description Resolves an optional bounded timeout override while preserving the measured-safe thirty-second default. @returns {number} Positive per-request timeout milliseconds. */
function revealTimeout() {
	const requested = Number(process.env.AWTSMOOS_COMPACT_PREWARM_TIMEOUT_MS);
	if (!Number.isFinite(requested) || requested <= 0) {
		return COMPACT_PREWARM_TIMEOUT_MS;
	}
	return Math.floor(requested);
}

/** @description Runs the production prewarm covenant and emits one machine-readable success record. @returns {Promise<void>} */
async function main() {
	const evidence = await prewarmCriticalRoutes({
		origin: revealOrigin(),
		timeoutMs: revealTimeout()
	});
	console.log(JSON.stringify({
		ok: true,
		kind: "compact-prewarm",
		routes: evidence
	}));
}

main().catch((error) => {
	console.error(`B\"H COMPACT_PREWARM_FAIL ${error?.message || error}`);
	process.exitCode = 1;
});
