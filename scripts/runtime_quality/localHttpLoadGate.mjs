#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localHttpLoadGate.mjs
 * @description
 * The Awtsmoos measures finite HTTP pressure without allowing an accidental public load test.
 * Awtsmoos.com records success, latency, and throughput across critical read-only surfaces.
 */

const origin = new URL(process.env.AWTSMOOS_LOAD_ORIGIN || 'http://127.0.0.1:8080');
const concurrency = boundedNumber(process.env.AWTSMOOS_LOAD_CONCURRENCY, 100, 1, 1000);
const requests = boundedNumber(process.env.AWTSMOOS_LOAD_REQUESTS, 3000, 1, 100000);
const paths = ['/', '/mawgawl/sefarim/', '/apps/rebbe/', '/api/contact/status'];

assertLoopback(origin);

const latencies = [];
let completed = 0;
let failed = 0;
let nextRequest = 0;
const startedAt = performance.now();

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const durationMs = performance.now() - startedAt;
latencies.sort((left, right) => left - right);
const report = {
	ok: failed === 0,
	origin: origin.origin,
	concurrency,
	requests,
	completed,
	failed,
	durationMs: Math.round(durationMs),
	requestsPerSecond: Number((completed / (durationMs / 1000)).toFixed(2)),
	p50Ms: percentile(latencies, 0.50),
	p95Ms: percentile(latencies, 0.95),
	p99Ms: percentile(latencies, 0.99),
	maxMs: Math.round(latencies.at(-1) || 0)
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

/**
 * Runs one bounded request worker until the shared request budget is exhausted.
 * @returns {Promise<void>} Promise resolved after this worker has no more assignments.
 */
async function worker() {
	while (true) {
		const index = nextRequest++;
		if (index >= requests) return;
		await measure(paths[index % paths.length]);
	}
}

/**
 * Measures one read-only request and records transport or HTTP failure without aborting peers.
 * @param {string} path - Origin-relative critical surface.
 * @returns {Promise<void>} Promise resolved when one request has been accounted for.
 */
async function measure(path) {
	const started = performance.now();
	try {
		const response = await fetch(new URL(path, origin), {
			redirect: 'follow',
			signal: AbortSignal.timeout(10000)
		});
		await response.arrayBuffer();
		if (!response.ok) failed += 1;
	} catch {
		failed += 1;
	} finally {
		latencies.push(performance.now() - started);
		completed += 1;
	}
}

/**
 * Returns one nearest-rank percentile in whole milliseconds.
 * @param {number[]} values - Ascending latency values.
 * @param {number} ratio - Fraction from zero through one.
 * @returns {number} Whole-millisecond percentile.
 */
function percentile(values, ratio) {
	if (!values.length) return 0;
	const index = Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1);
	return Math.round(values[index]);
}

/**
 * Parses and bounds one numeric environment setting.
 * @param {string|undefined} value - Optional environment value.
 * @param {number} fallback - Default when absent or invalid.
 * @param {number} minimum - Inclusive minimum.
 * @param {number} maximum - Inclusive maximum.
 * @returns {number} Safe integer setting.
 */
function boundedNumber(value, fallback, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

/**
 * Prevents this benchmark from targeting a public or remote machine by accident.
 * @param {URL} target - Candidate load-test origin.
 * @returns {void}
 */
function assertLoopback(target) {
	const host = target.hostname.toLowerCase();
	if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
		throw new Error(`Refusing non-loopback load target: ${target.origin}`);
	}
}
