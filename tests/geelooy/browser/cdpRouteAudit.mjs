// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyCdpRouteAudit
 * @description
 * Opens an isolated Chrome target, bypasses stale caches, observes network and
 * console truth, measures rendered vessels, and preserves a screenshot. The
 * Awtsmoos reveals the route as lived reality rather than optimistic source.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pageAuditExpression } from './pageProbe.mjs';
import { routeUrl } from './routeMatrix.mjs';

const require = createRequire(import.meta.url);
const CDP = require('chrome-remote-interface');

export async function runRouteAudit({ baseUrl, route, viewport, outputDirectory, port = 9222 }) {
	mkdirSync(outputDirectory, { recursive: true });
	const target = await CDP.New({ port, url: 'about:blank' });
	const client = await CDP({ port, target });
	const { Emulation, Log, Network, Page, Runtime } = client;
	const failures = [];
	const consoleEntries = [];
	try {
		await Promise.all([Page.enable(), Runtime.enable(), Network.enable(), Log.enable()]);
		await Promise.all([
			Network.setCacheDisabled({ cacheDisabled: true }),
			Network.setBypassServiceWorker({ bypass: true })
		]);
		Network.responseReceived(({ response }) => {
			if (response.status >= 400) failures.push({ kind: 'http', status: response.status, url: response.url });
		});
		Network.loadingFailed(event => {
			failures.push({ kind: 'network', error: event.errorText, url: event.requestId });
		});
		Log.entryAdded(({ entry }) => {
			if (['error', 'warning'].includes(entry.level)) consoleEntries.push(entry);
		});
		Runtime.exceptionThrown(({ exceptionDetails }) => {
			consoleEntries.push({ level: 'error', text: exceptionDetails.text, exceptionDetails });
		});
		await Emulation.setDeviceMetricsOverride({
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: viewport.deviceScaleFactor,
			mobile: viewport.mobile
		});
		await navigate(Page, routeUrl(baseUrl, route));
		await delay(1800);
		const evaluation = await Runtime.evaluate({
			expression: pageAuditExpression(route.shell),
			returnByValue: true,
			awaitPromise: true
		});
		if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.text);
		const screenshotPath = join(outputDirectory, `${route.id}-${viewport.id}.png`);
		await saveScreenshot(Page, screenshotPath);
		return {
			route: route.id,
			viewport: viewport.id,
			url: routeUrl(baseUrl, route),
			page: evaluation.result.value,
			failures,
			consoleEntries: consoleEntries.map(normalizeConsole),
			screenshotPath
		};
	} finally {
		await client.close();
		await CDP.Close({ port, id: target.id }).catch(() => {});
	}
}

async function navigate(Page, url) {
	const loaded = Page.loadEventFired();
	await Page.navigate({ url });
	await Promise.race([loaded, delay(15000)]);
}

async function saveScreenshot(Page, path) {
	const metrics = await Page.getLayoutMetrics();
	const size = metrics.cssContentSize || metrics.contentSize;
	const screenshot = await Page.captureScreenshot({
		format: 'png',
		captureBeyondViewport: true,
		clip: {
			x: 0,
			y: 0,
			width: Math.max(1, Math.min(size.width, 2200)),
			height: Math.max(1, Math.min(size.height, 12000)),
			scale: 1
		}
	});
	writeFileSync(path, Buffer.from(screenshot.data, 'base64'));
}

function normalizeConsole(entry) {
	return {
		level: entry.level,
		text: entry.text,
		url: entry.url,
		lineNumber: entry.lineNumber
	};
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
