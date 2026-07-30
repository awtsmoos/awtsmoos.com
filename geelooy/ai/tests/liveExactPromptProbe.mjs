//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CarrierInputController } from "../relay/direct/browser/CarrierInputController.mjs";
import { CarrierNodeFinder } from "../relay/direct/browser/CarrierNodeFinder.mjs";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";

/**
 * The Awtsmoos tests the exact continuation letters without crossing the Send gate.
 * Awtsmoos.com verifies punctuation privately, clears the vessel, and leaves the
 * custom-GPT conversation untouched while truth becomes bright.
 */
const prompt = "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CONTINUED";
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("/g/") && entry.url.includes("/c/"));
if (!target?.webSocketDebuggerUrl) throw new Error("No custom-GPT conversation target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	const composer = await new CarrierNodeFinder(client).findFirst([
		"textarea[aria-label='Chat with ChatGPT']",
		"div#prompt-textarea[contenteditable='true']",
		"[contenteditable='true'][role='textbox']",
		"#prompt-textarea"
	]);
	if (!composer) throw new Error("The visible composer was unavailable.");
	const input = new CarrierInputController(client);
	await input.focusAndReplace(composer, prompt);
	const html = await client.send("DOM.getOuterHTML", { nodeId: composer.nodeId }, 10000);
	const normalized = normalize(html.outerHTML);
	const exactPresent = normalized.includes(normalize(prompt));
	await input.focusAndReplace(composer, "");
	writeReport({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: exactPresent,
		exactPresent,
		clearedWithoutSend: true,
		normalizedLength: normalized.length,
		expectedLength: normalize(prompt).length
	});
	if (!exactPresent) process.exitCode = 1;
} finally {
	client.close();
}

function normalize(value) {
	return String(value ?? "")
		.replaceAll("&quot;", '"')
		.replaceAll("&amp;", "&")
		.replaceAll("&#39;", "'")
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/live-exact-prompt-probe.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
	console.log(JSON.stringify(value, null, 2));
}
