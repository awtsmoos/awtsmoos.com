//B"H
//Boruch Hashem
//Blessed be He

const { fetchRoute } = require("./fetch.cjs");
const { assessResponse } = require("./policy.cjs");

/**
 * @file Walks the server-rendered Ikar Torah graph with bounded parallelism.
 * @description The crawl follows only certified discovery links, never arbitrary page links,
 * and records explicit truncation whenever configured limits prevent complete traversal.
 */
async function crawlTorah(options = {}) {
	const origin = normalizedOrigin(options.origin);
	const concurrency = boundedInteger(options.concurrency, 4, 1, 12);
	const maxRoutes = boundedInteger(options.maxRoutes, 10000, 1, 50000);
	const timeoutMs = boundedInteger(options.timeoutMs, 8000, 500, 30000);
	const queue = ["/heichelos/ikar"];
	const seen = new Set(queue);
	const results = [];
	let cursor = 0;

	while (cursor < queue.length && cursor < maxRoutes) {
		const paths = queue.slice(cursor, Math.min(cursor + concurrency, maxRoutes));
		cursor += paths.length;
		const batch = await Promise.all(paths.map(path => inspect(origin, path, timeoutMs)));
		for (const result of batch) {
			results.push(result);
			for (const link of result.links || []) {
				if (seen.has(link.path) || seen.size >= maxRoutes) continue;
				seen.add(link.path);
				queue.push(link.path);
			}
		}
		options.onProgress?.({ completed: results.length, discovered: seen.size });
	}

	return summarize(results, queue.length > results.length || seen.size >= maxRoutes);
}

/** Reads and assesses one route without allowing network failure to abort sibling testimony. */
async function inspect(origin, path, timeoutMs) {
	const fetched = await fetchRoute(origin, path, timeoutMs);
	const assessed = assessResponse({
		path,
		status: fetched.status,
		html: fetched.html,
		elapsedMs: fetched.elapsedMs,
		origin
	});
	if (fetched.error) assessed.issues.unshift(fetched.error);
	return assessed;
}

/** Collapses route testimony into one bounded release-facing report. */
function summarize(results, truncated) {
	const failures = results.filter(result => result.issues.length);
	const elapsed = results.map(result => result.elapsedMs);
	const kinds = countKinds(results);
	return {
		ok: failures.length === 0 && !truncated,
		truncated,
		totalRoutes: results.length,
		failures: failures.length,
		kinds,
		maxElapsedMs: elapsed.length ? Math.max(...elapsed) : 0,
		failureDetails: failures.slice(0, 200),
		results
	};
}

/** Counts root, series, and post testimony without expanding report structure indefinitely. */
function countKinds(results) {
	const counts = {};
	for (const result of results) counts[result.kind] = (counts[result.kind] || 0) + 1;
	return counts;
}

/** Normalizes the one allowed crawl origin and rejects malformed configuration early. */
function normalizedOrigin(value) {
	const url = new URL(String(value || "http://127.0.0.1:18473"));
	return `${url.protocol}//${url.host}`;
}

/** Converts environment/configuration values into explicit bounded integers. */
function boundedInteger(value, fallback, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.min(maximum, Math.max(minimum, Math.floor(number)));
}

module.exports = {
	boundedInteger,
	crawlTorah,
	inspect,
	normalizedOrigin,
	summarize
};
