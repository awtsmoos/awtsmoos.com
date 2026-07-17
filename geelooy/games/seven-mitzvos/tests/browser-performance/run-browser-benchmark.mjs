//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RunBrowserBenchmark
 * @description
 * Chrome measures a blank target and the real Awtsmoos.com page through one
 * display pipeline, then always closes its own target. The Awtsmoos needs no
 * benchmark tab; finite evidence must leave no hidden workload behind.
 */
import { writeFile } from 'node:fs/promises';
import { withTarget } from './cdp-client.mjs';
import { observeBrowserFailures } from './browser-observers.mjs';
import {
	frameExpression,
	interactionExpression,
	readinessExpression
} from './browser-benchmark-expressions.mjs';
import {
	finalizeReport,
	summarize,
	summarizeFrames
} from './browser-benchmark-report.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const pageUrl = process.env.PAGE_URL ||
	'http://127.0.0.1:5180/geelooy/games/seven-mitzvos/?benchmark=1';
const output = process.env.BENCHMARK_OUTPUT || 'browser-performance-report.json';
const report = await withTarget(port, 'about:blank', async client => {
	const failures = observeBrowserFailures(client);
	await enableDomains(client);
	const baselineValues = await evaluate(client, frameExpression(), true);
	const loaded = client.waitFor('Page.loadEventFired');
	await client.send('Page.navigate', { url: pageUrl });
	await loaded;
	await evaluate(
		client,
		readinessExpression('[data-living-action="advance"]'),
		true
	);
	const frameValues = await evaluate(client, frameExpression(), true);
	const interactions = await evaluate(client, interactionExpression(), true);
	const metrics = await client.send('Performance.getMetrics');
	return createReport({
		failures,
		baselineValues,
		frameValues,
		interactions,
		metrics
	});
});
await writeFile(output, `${JSON.stringify(report, null, '\t')}\n`, 'utf8');
console.log(JSON.stringify(report));
if (!report.passed) {
	process.exitCode = 1;
}

function createReport(measurement) {
	const interactionSummary = summarize(
		measurement.interactions.interactions
	);
	return finalizeReport({
		measuredAt: new Date().toISOString(),
		pageUrl,
		baselineFrames: summarizeFrames(measurement.baselineValues),
		frames: summarizeFrames(measurement.frameValues),
		interactions: {
			...interactionSummary,
			p95Milliseconds: interactionSummary.p95
		},
		saveMilliseconds: measurement.interactions.saveMilliseconds,
		saveCompletionMilliseconds:
			measurement.interactions.saveCompletionMilliseconds,
		heapMegabytes: measurement.interactions.heapMegabytes,
		longTasks: summarize(measurement.interactions.longTasks),
		navigation: measurement.interactions.navigation,
		regionCount: measurement.interactions.regionCount,
		cdpMetrics: Object.fromEntries(
			measurement.metrics.metrics.map(metric => [
				metric.name,
				metric.value
			])
		),
		consoleErrors: measurement.failures.consoleErrors,
		networkFailures: measurement.failures.networkFailures
	});
}

async function enableDomains(client) {
	await Promise.all([
		client.send('Page.enable'),
		client.send('Runtime.enable'),
		client.send('Log.enable'),
		client.send('Network.enable'),
		client.send('Performance.enable')
	]);
	await client.send('Page.bringToFront');
}

async function evaluate(client, expression, awaitPromise = false) {
	const response = await client.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text);
	}
	return response.result.value;
}
