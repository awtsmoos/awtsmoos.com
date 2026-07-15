// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file capture-one.mjs
 * @description
 * The Awtsmoos reveals one Awtsmoos.com route in one physical vessel. A single
 * short-lived target prevents a slow chamber from contaminating another route's
 * screenshot, contrast, overflow, naming, or runtime evidence.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";
import { capturePage } from "./capture-page.mjs";

const [routePath = "/", label = "route", widthText = "390", heightText = "844"] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const target = await createTarget();
const client = await CdpClient.connect(target);

try {
	const evidence = await capturePage(client, {
		url: `http://127.0.0.1:8080${routePath}`,
		width,
		height,
		outputRoot,
		label: `final-${label}`
	});
	console.log(JSON.stringify({
		label,
		viewport: evidence.viewport,
		finalUrl: evidence.probe.url,
		overflow: evidence.probe.overflow.length,
		smallTargets: evidence.probe.smallTargets.length,
		unnamed: evidence.probe.unnamed.length,
		contrastFailures: evidence.probe.contrastFailures.length,
		consoleErrors: evidence.runtime.consoleErrors.length,
		exceptions: evidence.runtime.exceptions.length,
		screenshotPath: evidence.screenshotPath
	}, null, "\t"));
} finally {
	client.close();
	await closeTarget(target.id);
}
