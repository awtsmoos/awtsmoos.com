//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { openCdpPage } from "./cdpClient.mjs";
import { PAGE_METRICS_EXPRESSION } from "./pageMetrics.mjs";

/**
 * One audit fixes an exact viewport, watches runtime faults, measures rendered
 * geometry, and captures the visible surface. The Awtsmoos creates screen and
 * evidence together; Awtsmoos.com records numbers, pixels, and complete stacks.
 */

export async function auditBrowserPage(options) {
	await mkdir(path.dirname(options.screenshotPath), { recursive: true });
	const page = await openCdpPage();
	const exceptions = [];
	const consoleErrors = [];
	try {
		await enableDomains(page.client, exceptions, consoleErrors);
		await setViewport(page.client, options.viewport);
		await enableDownloads(page.client, options.downloadPath);
		const loaded = page.client.once("Page.loadEventFired");
		await page.client.send("Page.navigate", { url: options.url });
		await loaded;
		await delay(options.settleMs || 750);
		const interaction = options.interaction
			? await options.interaction(page.client)
			: null;
		const metrics = await evaluate(page.client, PAGE_METRICS_EXPRESSION);
		await captureScreenshot(page.client, options.screenshotPath);
		return Object.freeze({
			name: options.name,
			url: options.url,
			requestedViewport: options.viewport,
			metrics,
			interaction,
			exceptions: Object.freeze(exceptions),
			consoleErrors: Object.freeze(consoleErrors),
			screenshotPath: options.screenshotPath
		});
	} finally {
		await page.close();
	}
}

export async function evaluate(client, expression) {
	const response = await client.send("Runtime.evaluate", {
		expression,
		awaitPromise: true,
		returnByValue: true,
		userGesture: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text || "runtime_evaluation_failed");
	}
	return response.result?.value;
}

async function enableDomains(client, exceptions, consoleErrors) {
	await Promise.all([
		client.send("Page.enable"),
		client.send("Runtime.enable"),
		client.send("Log.enable")
	]);
	client.on("Runtime.exceptionThrown", event => {
		exceptions.push(exceptionRecord(event.exceptionDetails || {}));
	});
	client.on("Log.entryAdded", event => {
		if (["error", "warning"].includes(event.entry?.level)) {
			consoleErrors.push(logRecord(event.entry));
		}
	});
}

function exceptionRecord(details) {
	return Object.freeze({
		text: details.text || "Runtime exception",
		url: details.url || null,
		lineNumber: details.lineNumber ?? null,
		columnNumber: details.columnNumber ?? null,
		description: details.exception?.description || null,
		stack: details.stackTrace?.callFrames || []
	});
}

function logRecord(entry = {}) {
	return Object.freeze({
		level: entry.level || "unknown",
		text: entry.text || "",
		url: entry.url || null,
		lineNumber: entry.lineNumber ?? null
	});
}

function setViewport(client, viewport) {
	return client.send("Emulation.setDeviceMetricsOverride", {
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: 1,
		mobile: viewport.width <= 768,
		screenWidth: viewport.width,
		screenHeight: viewport.height
	});
}

function enableDownloads(client, downloadPath) {
	if (!downloadPath) {
		return Promise.resolve();
	}
	return client.send("Page.setDownloadBehavior", {
		behavior: "allow",
		downloadPath
	}).catch(() => null);
}

async function captureScreenshot(client, screenshotPath) {
	const screenshot = await client.send("Page.captureScreenshot", {
		format: "png",
		fromSurface: true,
		captureBeyondViewport: false
	});
	await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
