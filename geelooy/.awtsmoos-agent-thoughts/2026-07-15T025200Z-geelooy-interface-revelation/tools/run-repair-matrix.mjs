// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-repair-matrix.mjs
 * @description
 * The Awtsmoos returns to each repaired Awtsmoos.com chamber at mobile and
 * desktop widths. One route failure is recorded truthfully without erasing the
 * screenshots and receipts already revealed by every other route.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";
import { capturePage } from "./capture-page.mjs";

const origin = "http://127.0.0.1:8080";
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const routes = [
	["home", "/"],
	["heichelos", "/heichelos"],
	["ikar", "/heichelos/ikar"],
	["mail", "/email/"],
	["social-composer", "/social-composer/"]
];
const viewports = [
	["mobile", 390, 844],
	["desktop", 1440, 1000]
];
const target = await createTarget();
const client = await CdpClient.connect(target);
const summary = [];

try {
	for (const [routeName, routePath] of routes) {
		for (const [viewportName, width, height] of viewports) {
			try {
				const evidence = await capturePage(client, {
					url: `${origin}${routePath}`,
					width,
					height,
					outputRoot,
					label: `repair-${routeName}-${viewportName}`
				});
				summary.push(summarizeEvidence(routeName, viewportName, evidence));
			} catch (error) {
				summary.push({
					routeName,
					viewportName,
					captureError: error.message
				});
			}
		}
	}
} finally {
	client.close();
	await closeTarget(target.id);
}

function summarizeEvidence(routeName, viewportName, evidence) {
	return {
		routeName,
		viewportName,
		finalUrl: evidence.probe.url,
		overflow: evidence.probe.overflow.length,
		smallTargets: evidence.probe.smallTargets.length,
		unnamed: evidence.probe.unnamed.length,
		contrastFailures: evidence.probe.contrastFailures.length,
		consoleErrors: evidence.runtime.consoleErrors.length,
		exceptions: evidence.runtime.exceptions.length
	};
}

const resultPath = path.join(
	outputRoot,
	"results",
	"repair-route-matrix-summary.json"
);
await fs.writeFile(
	resultPath,
	JSON.stringify(summary, null, "\t")
);
console.log(JSON.stringify(summary, null, "\t"));
