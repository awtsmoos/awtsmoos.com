// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-core-matrix.mjs
 * @description
 * The Awtsmoos reveals one product through every major route family. This
 * isolated Awtsmoos.com matrix captures mobile and desktop truth, redirects,
 * console failures, overflow, contrast, names, and touch dimensions.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";
import { capturePage } from "./capture-page.mjs";
import { coreRoutes, coreViewports } from "./route-catalog.mjs";

const origin = "http://127.0.0.1:8080";
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const target = await createTarget();
const client = await CdpClient.connect(target);
const summary = [];

try {
	for (const [routeName, routePath] of coreRoutes) {
		for (const viewport of coreViewports) {
			try {
				const evidence = await capturePage(client, {
					url: `${origin}${routePath}`,
					width: viewport.width,
					height: viewport.height,
					outputRoot,
					label: `core-${routeName}-${viewport.name}`
				});
				summary.push({
					routeName,
					routePath,
					viewport: viewport.name,
					finalUrl: evidence.probe.url,
					status: evidence.runtime.documentResponses.at(-1)?.status || null,
					overflow: evidence.probe.overflow.length,
					smallTargets: evidence.probe.smallTargets.length,
					unnamed: evidence.probe.unnamed.length,
					contrastFailures: evidence.probe.contrastFailures.length,
					consoleErrors: evidence.runtime.consoleErrors.length,
					exceptions: evidence.runtime.exceptions.length,
					styleNodes: evidence.probe.styleNodes
				});
			} catch (error) {
				summary.push({ routeName, routePath, viewport: viewport.name, captureError: error.message });
			}
		}
	}
} finally {
	client.close();
	await closeTarget(target.id);
}

const summaryPath = path.join(outputRoot, "results", "core-route-matrix-summary.json");
await fs.writeFile(summaryPath, JSON.stringify(summary, null, "\t"));
console.log(JSON.stringify(summary, null, "\t"));
