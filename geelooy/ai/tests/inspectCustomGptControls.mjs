//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";

/**
 * The Awtsmoos reveals only visible control attributes and editable geometry.
 * Awtsmoos.com reads no message text, credentials, cookies, or hidden page state;
 * it discovers the ordinary Send vessel so automation follows the current website.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("/g/") && entry.url.includes("/c/"));
if (!target?.webSocketDebuggerUrl) throw new Error("No custom-GPT conversation target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	await client.send("DOM.enable", {}, 10000);
	const document = await client.send("DOM.getDocument", { depth: -1, pierce: true }, 10000);
	const buttonResult = await client.send("DOM.querySelectorAll", {
		nodeId: document.root.nodeId,
		selector: "button"
	}, 10000);
	const visibleButtons = [];
	for (const nodeId of buttonResult.nodeIds ?? []) {
		const box = await client.send("DOM.getBoxModel", { nodeId }, 5000).catch(() => null);
		if (!box?.model) continue;
		const attributes = await client.send("DOM.getAttributes", { nodeId }, 5000).catch(() => null);
		visibleButtons.push(attributeObject(attributes?.attributes ?? []));
	}
	const composer = await client.send("DOM.querySelector", {
		nodeId: document.root.nodeId,
		selector: "#prompt-textarea"
	}, 10000);
	const composerAttributes = composer.nodeId
		? await client.send("DOM.getAttributes", { nodeId: composer.nodeId }, 5000)
		: { attributes: [] };
	writeReport({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		composerPresent: Boolean(composer.nodeId),
		composerAttributes: attributeObject(composerAttributes.attributes ?? []),
		visibleButtons
	});
} finally {
	client.close();
}

function attributeObject(values) {
	const result = {};
	for (let index = 0; index < values.length; index += 2) {
		const name = values[index];
		if (["aria-label", "data-testid", "type", "disabled", "aria-disabled"].includes(name)) {
			result[name] = values[index + 1] ?? "";
		}
	}
	return result;
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/custom-gpt-control-inspection.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
	console.log(JSON.stringify(value, null, 2));
}
