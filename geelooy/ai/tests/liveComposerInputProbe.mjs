//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CarrierInputController } from "../relay/direct/browser/CarrierInputController.mjs";
import { CarrierNodeFinder } from "../relay/direct/browser/CarrierNodeFinder.mjs";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";

/**
 * The Awtsmoos tests only the visible composer vessel, never the Send threshold.
 * Awtsmoos.com inserts a harmless marker, verifies it privately, then clears it so
 * no conversation changes and no uncertain website POST can arise.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("/g/") && entry.url.includes("/c/"));
if (!target?.webSocketDebuggerUrl) throw new Error("No custom-GPT conversation target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	const finder = new CarrierNodeFinder(client);
	const composer = await finder.findFirst([
		"textarea[aria-label='Chat with ChatGPT']",
		"div#prompt-textarea[contenteditable='true']",
		"[contenteditable='true'][role='textbox']",
		"#prompt-textarea"
	]);
	if (!composer) throw new Error("The visible composer was unavailable.");
	const input = new CarrierInputController(client);
	const marker = "AWTSMOOS COMPOSER INPUT PROBE";
	await input.focusAndReplace(composer, marker);
	const afterInsert = await client.send("DOM.getOuterHTML", { nodeId: composer.nodeId }, 10000);
	const markerPresent = afterInsert.outerHTML.includes(marker);
	await input.focusAndReplace(composer, "");
	writeReport({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: markerPresent,
		markerPresent,
		clearedWithoutSend: true
	});
	if (!markerPresent) process.exitCode = 1;
} finally {
	client.close();
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/live-composer-input-probe.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
	console.log(JSON.stringify(value, null, 2));
}
