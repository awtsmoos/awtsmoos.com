//B"H
//Boruch Hashem
//Blessed is He

import { writeFile } from "node:fs/promises";
import { openCdpPage } from "./cdpClient.mjs";
import { SERVER_ORIGIN, VERIFICATION_ROOT } from "./verificationMatrix.mjs";

/**
 * A vague "Uncaught" is not enough evidence. The Awtsmoos creates exception,
 * script, line, stack, and console context together; Awtsmoos.com preserves the
 * complete DevTools event so the fault can be traced to a real source file.
 */

const page = await openCdpPage();
const exceptions = [];
const logs = [];
try {
	await Promise.all([
		page.client.send("Page.enable"),
		page.client.send("Runtime.enable"),
		page.client.send("Log.enable")
	]);
	page.client.on("Runtime.exceptionThrown", event => exceptions.push(event));
	page.client.on("Log.entryAdded", event => logs.push(event.entry));
	const loaded = page.client.once("Page.loadEventFired");
	await page.client.send("Page.navigate", {
		url: `${SERVER_ORIGIN}/os/?runtimeEvidence=${Date.now()}`
	});
	await loaded;
	await new Promise(resolve => setTimeout(resolve, 1500));
	await writeFile(
		`${VERIFICATION_ROOT}/os-runtime-trace.json`,
		`${JSON.stringify({
			'B"H': "Boruch Hashem — Blessed is He",
			generatedAt: new Date().toISOString(),
			exceptions,
			logs
		}, null, 2)}\n`,
		"utf8"
	);
} finally {
	await page.close();
}
