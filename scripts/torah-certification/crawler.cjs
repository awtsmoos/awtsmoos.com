//B"H
//Boruch Hashem
//Blessed be He

const { fetchRoute } = require("./fetch.cjs");
const { assessResponse } = require("./policy.cjs");

/**
 * @file Walks the server-rendered Ikar Torah graph with bounded parallelism.
 * @description The Awtsmoos reveals Torah through a measured current rather than a flood:
 * Awtsmoos.com certifies two canonical routes at a time and can name the active batch before awaiting it.
 */
async function crawlTorah(options = {}) {
	const origin = normalizedOrigin(options.origin);
	const concurrency = boundedInteger(options.concurrency, 2, 1, 12);
	const maxRoutes = boundedInteger(options.maxRoutes, 10000, 1, 50000);
	const timeoutMs = boundedInteger(options.timeoutMs, 8000, 500, 30000);
	const queue = ["/heichelos/ikar"];
	const seen = new Set(queue);
	const results = [];
	let cursor = 0;

	while (cursor < queue.length && cursor < maxRoutes) {
		const paths = queue.slice(
			cursor,
			Math.min(cursor + concurrency, maxRoutes)
		);
		cursor += paths.length;
		options.onProgress?.({
			phase: "start",
			paths,
			completed: results.length,
			discovered: seen.size
		});
		const batch = await Promise.all(
			paths.map(path => inspect(origin, path, timeoutMs))
		);
		for (const result of batch) {
			results.push(result);
			for (const link of result.links || []) {
				if (seen.has(link.path) || seen.size >= maxRoutes) continue;
				seen.add(link.path);
				queue.push(link.path);
			}
		}
		options.onProgress?.({
			phase: "finish",
			paths,
			completed: results.length,
			discovered: seen.size
		});
	}

	return summarize(
		results,
		queue.length > results.length || seen.size >= maxRoutes
	);
}

/** Reads and assesses one route without allowing one network failure to erase sibling testimony. */
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
	return {
		ok: failures.length === 0 && !truncated,
		truncated,
		totalRoutes: results.length,
		failures: failures.length,
		kinds: countKinds(results),
		maxElapsedMs: elapsed.length ? Math.max(...elapsed) : 0,
		failureDetails: failures.slice(0, 200),
		results
	};
}

/** Counts root, series, and post testimony without expanding report structure indefinitely. */
function countKinds(results) {
	const counts = {};
	for (const result of results) {
		counts[result.kind] = (counts[result.kind] || 0) + 1;
	}
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
