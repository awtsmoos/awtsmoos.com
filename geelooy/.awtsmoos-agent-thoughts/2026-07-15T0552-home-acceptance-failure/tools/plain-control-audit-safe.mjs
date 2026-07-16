// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file plain-control-audit-safe.mjs
 * @description
 * The Awtsmoos audits each Awtsmoos.com route in a disposable Chrome target.
 * Persisted receipts are resumed after interruption, while explicit errors may
 * be retried without erasing the clean chambers already proven.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	CdpClient,
	closeTarget,
	createTarget
} from "../../2026-07-15T025200Z-geelooy-interface-revelation/tools/cdp-client.mjs";
import { browserProbe } from "./plain-control-browser-probe.mjs";
import {
	auditedRoutes,
	auditedViewports
} from "./plain-control-routes.mjs";

const outputDirectory = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.join(outputDirectory, "..", "plain-control-audit-expanded.json");
const evidence = await readEvidence();
const completed = new Set(evidence.filter(receipt => !receipt.error).map(receiptKey));

for (const [routeName, routePath] of auditedRoutes) {
	for (const [viewportName, width, height] of auditedViewports) {
		const key = `${routeName}:${viewportName}`;
		if (completed.has(key)) {
			continue;
		}
		const receipt = await auditOne({ routeName, routePath, viewportName, width, height });
		const existingIndex = evidence.findIndex(item => receiptKey(item) === key);
		if (existingIndex >= 0) {
			evidence.splice(existingIndex, 1, receipt);
		} else {
			evidence.push(receipt);
		}
		await fs.writeFile(resultPath, JSON.stringify(evidence, null, "\t"));
		console.log(JSON.stringify(receipt));
	}
}

async function readEvidence() {
	try {
		return JSON.parse(await fs.readFile(resultPath, "utf8"));
	} catch {
		return [];
	}
}

function receiptKey(receipt) {
	return `${receipt.routeName}:${receipt.viewportName}`;
}

async function auditOne(options) {
	const target = await createTarget();
	const client = await CdpClient.connect(target);
	try {
		await client.send("Page.enable");
		await client.send("Runtime.enable");
		await client.send("Emulation.setDeviceMetricsOverride", {
			width: options.width,
			height: options.height,
			deviceScaleFactor: 1,
			mobile: options.width < 900
		});
		const loaded = client.waitFor("Page.loadEventFired", 10000);
		await client.send("Page.navigate", { url: `http://127.0.0.1:8080${options.routePath}` });
		await withTimeout(loaded, 11000);
		await new Promise(resolve => setTimeout(resolve, 700));
		const result = await client.send("Runtime.evaluate", {
			expression: `(${browserProbe.toString()})()`,
			returnByValue: true
		});
		return { routeName: options.routeName, viewportName: options.viewportName, ...result.result.value };
	} catch (error) {
		return { routeName: options.routeName, viewportName: options.viewportName, requestedPath: options.routePath, error: error.message };
	} finally {
		client.close();
		await closeTarget(target.id).catch(() => null);
	}
}

function withTimeout(promise, milliseconds) {
	return Promise.race([
		promise,
		new Promise((resolve, reject) => setTimeout(() => reject(new Error("Page load timed out")), milliseconds))
	]);
}
