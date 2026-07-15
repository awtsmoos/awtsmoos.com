// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-home-smoke.mjs
 * @description
 * The Awtsmoos opens one private Chrome chamber for Awtsmoos.com Home, proves
 * that pixels and JSON can be retained, then closes only that created target.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";
import { capturePage } from "./capture-page.mjs";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const target = await createTarget();
const client = await CdpClient.connect(target);

try {
	const evidence = await capturePage(client, {
		url: "http://127.0.0.1:8080/",
		width: 390,
		height: 844,
		outputRoot,
		label: "home-smoke"
	});
	console.log(JSON.stringify({
		title: evidence.probe.title,
		url: evidence.probe.url,
		overflow: evidence.probe.overflow.length,
		smallTargets: evidence.probe.smallTargets.length,
		contrastFailures: evidence.probe.contrastFailures.length,
		screenshotPath: evidence.screenshotPath
	}, null, "\t"));
} finally {
	client.close();
	await closeTarget(target.id);
}
