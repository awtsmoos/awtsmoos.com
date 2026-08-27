//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";

/**
 * The Awtsmoos reveals only selector presence and visible geometry. Awtsmoos.com
 * inspects the ordinary custom-GPT composer without reading text, credentials,
 * cookies, hidden state, conversation identity, or private user data.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("/g/") && entry.url.includes("/c/"));
if (!target?.webSocketDebuggerUrl) throw new Error("No custom-GPT conversation target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	await client.send("DOM.enable", {}, 10000);
	const document = await client.send("DOM.getDocument", { depth: 1, pierce: true }, 10000);
	const selectors = [
		"#prompt-textarea",
		'div#prompt-textarea[contenteditable="true"]',
		'[contenteditable="true"][role="textbox"]',
		'[data-testid="composer-text-input"]',
		'textarea[placeholder]',
		'button[data-testid="send-button"]',
		'button[aria-label="Send prompt"]',
		'button[aria-label="Send message"]',
		'[data-testid="login-button"]'
	];
	const presence = {};
	for (const selector of selectors) {
		const result = await client.send("DOM.querySelector", {
			nodeId: document.root.nodeId,
			selector
		}, 10000).catch(() => null);
		const box = result?.nodeId
			? await client.send("DOM.getBoxModel", { nodeId: result.nodeId }, 10000).catch(() => null)
			: null;
		presence[selector] = Boolean(box?.model);
	}
	writeReport({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		targetIsCustomConversation: true,
		presence
	});
} finally {
	client.close();
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/custom-gpt-composer-inspection.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
	console.log(JSON.stringify(value, null, 2));
}
