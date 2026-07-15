// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file capture-page.mjs
 * @description
 * The Awtsmoos gathers source, pixels, console truth, and computed behavior
 * into one Awtsmoos.com evidence vessel without submitting or mutating data.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { buildProbeExpression } from "./page-probe.mjs";

function safeName(value) {
	return value.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "home";
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function summarizeRuntime(client) {
	const logEntries = client.drainEvents("Log.entryAdded").map(event => event.params.entry);
	const exceptions = client.drainEvents("Runtime.exceptionThrown").map(event => event.params.exceptionDetails);
	const responses = client.drainEvents("Network.responseReceived").map(event => event.params).filter(item => item.type === "Document");
	return {
		documentResponses: responses.map(item => ({ url: item.response.url, status: item.response.status, mimeType: item.response.mimeType })),
		consoleErrors: logEntries.filter(entry => ["error", "warning"].includes(entry.level)).map(entry => ({ level: entry.level, text: entry.text, url: entry.url || "" })),
		exceptions: exceptions.map(item => ({ text: item.text, url: item.url || "", lineNumber: item.lineNumber, columnNumber: item.columnNumber }))
	};
}

export async function capturePage(client, options) {
	const { url, width, height, outputRoot, label = "route", reducedMotion = false, bypassServiceWorker = true } = options;
	await client.send("Page.enable");
	await client.send("Runtime.enable");
	await client.send("Log.enable");
	await client.send("Network.enable");
	await client.send("Network.setCacheDisabled", { cacheDisabled: true });
	await client.send("Network.setBypassServiceWorker", { bypass: bypassServiceWorker });
	await client.send("Emulation.setDeviceMetricsOverride", {
		width,
		height,
		deviceScaleFactor: 1,
		mobile: width <= 844,
		screenWidth: width,
		screenHeight: height
	});
	await client.send("Emulation.setEmulatedMedia", {
		features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }]
	});
	client.drainEvents();
	const loaded = client.waitFor("Page.loadEventFired", 20000);
	const navigation = await client.send("Page.navigate", { url });
	if (navigation.errorText) {
		throw new Error(`Navigation failed for ${url}: ${navigation.errorText}`);
	}
	await loaded;
	await delay(1200);
	const probeResult = await client.send("Runtime.evaluate", {
		expression: buildProbeExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	if (probeResult.exceptionDetails) {
		throw new Error(`Probe failed for ${url}: ${probeResult.exceptionDetails.text}`);
	}
	const metrics = await client.send("Page.getLayoutMetrics");
	const screenshot = await client.send("Page.captureScreenshot", {
		format: "png",
		captureBeyondViewport: true,
		fromSurface: true
	});
	const stem = `${safeName(label)}-${width}x${height}${reducedMotion ? "-reduced" : ""}`;
	const screenshotPath = path.join(outputRoot, "screenshots", `${stem}.png`);
	const resultPath = path.join(outputRoot, "results", `${stem}.json`);
	const evidence = {
		capturedAt: new Date().toISOString(),
		requestedUrl: url,
		viewport: { width, height },
		reducedMotion,
		bypassServiceWorker,
		navigation,
		contentSize: metrics.contentSize,
		runtime: summarizeRuntime(client),
		probe: probeResult.result.value,
		screenshotPath
	};
	await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
	await fs.mkdir(path.dirname(resultPath), { recursive: true });
	await fs.writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
	await fs.writeFile(resultPath, JSON.stringify(evidence, null, "\t"));
	return evidence;
}
