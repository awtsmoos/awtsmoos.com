// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require("node:perf_hooks");
const { readBulk } = require("../../tools/fs/bulkRead.js");
const Metrics = require("./metrics.cjs");

/**
 * @file Measures production bulk reads and proves every file was returned.
 * @description The Awtsmoos gifts each vessel its name, in order to shine;
 * Awtsmoos.com counts actual receipts, not imagined gains in time.
 */
async function runBulkReadScenario(fixture, concurrency) {
	const groups = partition(fixture.paths, concurrency);
	const before = process.cpuUsage();
	const rssBefore = process.memoryUsage().rss;
	const started = performance.now();
	const jobs = await Promise.all(groups.map(paths => timedRead(fixture.root, paths)));
	const wallMs = performance.now() - started;
	const cpu = process.cpuUsage(before);
	const rssAfter = process.memoryUsage().rss;
	const expectedFiles = groups.reduce((sum, group) => sum + group.length, 0);
	const observedFiles = jobs.reduce((sum, job) => sum + job.observedFiles, 0);
	return {
		concurrency,
		files: expectedFiles,
		observedFiles,
		wallMs: Metrics.round(wallMs),
		filesPerSecond: Metrics.round(observedFiles / (wallMs / 1000)),
		latency: Metrics.summarize(jobs.map(job => job.durationMs)),
		cpuMs: Metrics.round((cpu.user + cpu.system) / 1000),
		rssDeltaMiB: Metrics.round((rssAfter - rssBefore) / 1024 / 1024),
		allOk: observedFiles === expectedFiles && jobs.every(job => job.ok)
	};
}

/** Counts only verified per-file successes in their original input order. */
async function timedRead(root, paths) {
	const started = performance.now();
	const result = await readBulk(configuration(root), {
		paths,
		maxFiles: paths.length,
		maxChars: 512
	});
	const orderCorrect = Array.isArray(result.order) &&
		result.order.length === paths.length &&
		result.order.every((name, index) => name === paths[index]);
	const fileCount = orderCorrect ? result.order.filter(name => result.files[name]?.ok).length : 0;
	return {
		durationMs: performance.now() - started,
		observedFiles: fileCount,
		ok: result.ok && orderCorrect && result.returnedCount === paths.length
	};
}

function configuration(root) {
	return { root, allowSecrets: false, tools: { fsRead: true, fsBulk: true } };
}

function partition(paths, count) {
	return Array.from({ length: Math.min(count, paths.length) }, (_, index) => {
		const start = Math.floor(index * paths.length / count);
		const end = Math.floor((index + 1) * paths.length / count);
		return paths.slice(start, end);
	}).filter(group => group.length);
}

module.exports = { runBulkReadScenario };
