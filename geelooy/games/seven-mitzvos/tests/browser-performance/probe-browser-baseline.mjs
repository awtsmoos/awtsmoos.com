//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProbeBrowserBaseline
 * @description
 * A blank Chrome target and the real Awtsmoos.com page are sampled through the
 * same display pipeline, revealing which frame variation belongs to the host
 * and which belongs to the application. Failed resource URLs remain explicit.
 */
import { CdpClient, createTarget } from './cdp-client.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const pageUrl = process.env.PAGE_URL ||
	'http://127.0.0.1:5180/geelooy/games/seven-mitzvos/?probe=1';
const target = await createTarget(port, 'about:blank');
const client = new CdpClient(target.webSocketDebuggerUrl);
const failures = [];
await client.connect();
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
console.log(JSON.stringify({
	blank: summarize(blankFrames),
	app: summarize(appFrames),
	failures
}));
client.close();

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
	const ordered = [...values].sort((a, b) => a - b);
	const mean = ordered.reduce((sum, value) => sum + value, 0) / ordered.length;
	const percentile = ratio => {
		return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * ratio))];
	};
	return {
		averageFps: 1000 / mean,
		meanMilliseconds: mean,
		p95Milliseconds: percentile(0.95),
		droppedFrameRatio: values.filter(value => value > 25).length / values.length
	};
}
