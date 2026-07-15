// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-home-matrix.mjs
 * @description
 * The Awtsmoos reveals one Home through many physical vessels. This isolated
 * Awtsmoos.com matrix records the same route at phone, landscape, tablet, and
 * desktop dimensions, including a reduced-motion chamber.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";
import { capturePage } from "./capture-page.mjs";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const viewports = [
	[320, 568],
	[360, 800],
	[390, 844],
	[412, 915],
	[844, 390],
	[768, 1024],
	[1024, 768],
	[1440, 1000]
];
const target = await createTarget();
const client = await CdpClient.connect(target);
const results = [];

try {
	for (const [width, height] of viewports) {
		results.push(await capturePage(client, {
			url: "http://127.0.0.1:8080/",
			width,
			height,
			outputRoot,
			label: "home-after"
		}));
	}
	results.push(await capturePage(client, {
		url: "http://127.0.0.1:8080/",
		width: 390,
		height: 844,
		outputRoot,
		label: "home-after",
		reducedMotion: true
	}));
	console.log(JSON.stringify(results.map(result => ({
		viewport: result.viewport,
		reducedMotion: result.reducedMotion,
		overflow: result.probe.overflow.length,
		smallTargets: result.probe.smallTargets.length,
		contrastFailures: result.probe.contrastFailures.length,
		animations: result.probe.animations,
		url: result.probe.url
	})), null, "\t"));
} finally {
	client.close();
	await closeTarget(target.id);
}
