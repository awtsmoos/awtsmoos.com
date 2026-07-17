//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProbeBrowserBaseline
 * @description
 * A blank Chrome target and Awtsmoos.com share one measured display pipeline,
 * and the probe always closes its own page. The Awtsmoos needs no calibration;
 * finite comparisons must not accumulate hidden background workloads.
 */
import { withTarget } from './cdp-client.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const pageUrl = process.env.PAGE_URL ||
	'http://127.0.0.1:5180/geelooy/games/seven-mitzvos/?probe=1';
const report = await withTarget(port, 'about:blank', async client => {
	const failures = [];
	client.on('Network.responseReceived', event => {
		if (event.response.status >= 400) {
			failures.push({
				status: event.response.status,
				url: event.response.url,
				type: event.type
			});
		}
	});
	await Promise.all([
		client.send('Page.enable'),
		client.send('Runtime.enable'),
		client.send('Network.enable')
	]);
	const blankFrames = await sampleFrames(client);
	const loaded = client.waitFor('Page.loadEventFired');
	await client.send('Page.navigate', { url: pageUrl });
	await loaded;
	await waitForSelector(client, '[data-living-action="advance"]');
	const appFrames = await sampleFrames(client);
	return {
		blank: summarize(blankFrames),
		app: summarize(appFrames),
		failures
	};
});
console.log(JSON.stringify(report));

async function sampleFrames(client) {
	const response = await client.send('Runtime.evaluate', {
		expression: `new Promise(resolve => {
			const values = [];
			let previous = performance.now();
			const step = now => {
				values.push(now - previous);
				previous = now;
				if (values.length >= 240) resolve(values.slice(5));
				else requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		})`,
		awaitPromise: true,
		returnByValue: true
	});
	return response.result.value;
}

async function waitForSelector(client, selector) {
	await client.send('Runtime.evaluate', {
		expression: `new Promise(resolve => {
			const ready = () => document.querySelector(${JSON.stringify(selector)});
			if (ready()) { resolve(true); return; }
			const timer = setInterval(() => {
				if (ready()) { clearInterval(timer); resolve(true); }
			}, 25);
		})`,
		awaitPromise: true,
		returnByValue: true
	});
}

function summarize(values) {
	const ordered = [...values].sort((first, second) => first - second);
	const mean = ordered.reduce((sum, value) => sum + value, 0) /
		ordered.length;
	const percentile = ratio => {
		return ordered[Math.min(
			ordered.length - 1,
			Math.floor(ordered.length * ratio)
		)];
	};
	return {
		averageFps: 1000 / mean,
		meanMilliseconds: mean,
		p95Milliseconds: percentile(0.95),
		droppedFrameRatio: values.filter(value => value > 25).length /
			values.length
	};
}
