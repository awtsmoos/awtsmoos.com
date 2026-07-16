//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RunBrowserBenchmark
 * @description
 * Chrome measures a blank target and the real Awtsmoos.com page through one
 * display pipeline. Frame cadence, interactions, UI save pause, background save
 * completion, heap, network, console, navigation, and regions become evidence.
 */
import { writeFile } from 'node:fs/promises';
import { CdpClient, createTarget } from './cdp-client.mjs';
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
const target = await createTarget(port, 'about:blank');
const client = new CdpClient(target.webSocketDebuggerUrl);
const consoleErrors = [];
const networkFailures = [];
await client.connect();
client.on('Runtime.exceptionThrown', event => {
	consoleErrors.push(event.exceptionDetails.text || 'runtime_exception');
});
client.on('Log.entryAdded', event => {
	if (event.entry.level === 'error') {
		consoleErrors.push(
			`${event.entry.url || ''} ${event.entry.text}`.trim()
		);
	}
});
client.on('Network.responseReceived', event => {
	if (event.response.status >= 400) {
		networkFailures.push({
			status: event.response.status,
			url: event.response.url,
			type: event.type
		});
	}
});
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
const interactionSummary = summarize(interactions.interactions);
const report = finalizeReport({
	measuredAt: new Date().toISOString(),
	pageUrl,
	baselineFrames: summarizeFrames(baselineValues),
	frames: summarizeFrames(frameValues),
	interactions: {
		...interactionSummary,
		p95Milliseconds: interactionSummary.p95
	},
	saveMilliseconds: interactions.saveMilliseconds,
	saveCompletionMilliseconds: interactions.saveCompletionMilliseconds,
	heapMegabytes: interactions.heapMegabytes,
	longTasks: summarize(interactions.longTasks),
	navigation: interactions.navigation,
	regionCount: interactions.regionCount,
	cdpMetrics: Object.fromEntries(
		metrics.metrics.map(metric => [metric.name, metric.value])
	),
	consoleErrors,
	networkFailures
});
await writeFile(output, `${JSON.stringify(report, null, '\t')}\n`, 'utf8');
console.log(JSON.stringify(report));
client.close();
if (!report.passed) {
	process.exitCode = 1;
}

async function enableDomains(cdp) {
	await Promise.all([
		cdp.send('Page.enable'),
		cdp.send('Runtime.enable'),
		cdp.send('Log.enable'),
		cdp.send('Network.enable'),
		cdp.send('Performance.enable')
	]);
	await cdp.send('Page.bringToFront');
}

async function evaluate(cdp, expression, awaitPromise = false) {
	const response = await cdp.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text);
	}
	return response.result.value;
}
