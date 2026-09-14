//B"H
//Boruch Hashem
//Blessed be He

const { crawlTorah } = require("./crawler.cjs");

/**
 * @file Executes the bounded full-library server-first Torah certification gate.
 * @description The command emits a concise operational report while retaining per-route
 * evidence in memory only, so certification cannot itself create a giant report artifact.
 */
async function main() {
	const origin = process.env.TORAH_CERT_ORIGIN || "http://127.0.0.1:18473";
	const report = await crawlTorah({
		origin,
		concurrency: process.env.TORAH_CERT_CONCURRENCY,
		maxRoutes: process.env.TORAH_CERT_MAX_ROUTES,
		timeoutMs: process.env.TORAH_CERT_TIMEOUT_MS,
		onProgress: progress
	});
	const publicReport = {
		ok: report.ok,
		origin,
		totalRoutes: report.totalRoutes,
		failures: report.failures,
		truncated: report.truncated,
		kinds: report.kinds,
		maxElapsedMs: report.maxElapsedMs,
		failureDetails: report.failureDetails.map(compactFailure)
	};

	console.log(JSON.stringify(publicReport, null, 2));
	process.exitCode = report.ok ? 0 : 1;
}

/** Reports periodic progress without flooding long certification runs. */
function progress({ completed, discovered }) {
	if (completed === 1 || completed % 100 === 0) {
		console.error(`Torah certification: ${completed}/${discovered} routes checked`);
	}
}

/** Shrinks one failure to the fields an operator needs to reproduce it immediately. */
function compactFailure(result) {
	return {
		path: result.path,
		kind: result.kind,
		status: result.status,
		elapsedMs: result.elapsedMs,
		issues: result.issues
	};
}

main().catch(error => {
	console.error(`Torah certification crashed: ${error?.stack || error}`);
	process.exitCode = 1;
});
