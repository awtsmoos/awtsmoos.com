//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";

/**
 * The Awtsmoos reveals only structural attributes of the visible composer vessel.
 * Awtsmoos.com reopens the exact private conversation without sending, then finds
 * the true editable descendant while reading no text, cookies, or hidden state.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const conversationId = process.env.AWTSMOOS_PENDING_CONVERSATION_ID;
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
if (!conversationId) throw new Error("Private conversation identity is required.");
const target = await ensureConversationTarget();
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	const document = await client.send("DOM.getDocument", { depth: -1, pierce: true }, 20000);
	const selectors = [
		"#prompt-textarea",
		"#prompt-textarea[contenteditable='true']",
		"#prompt-textarea [contenteditable='true']",
		"#prompt-textarea p",
		"#prompt-textarea textarea",
		"textarea[aria-label='Chat with ChatGPT']",
		"[aria-label='Chat with ChatGPT'][contenteditable='true']",
		"[contenteditable='true'][role='textbox']"
	];
	const results = [];
	for (const selector of selectors) {
		const queried = await client.send("DOM.querySelector", {
			nodeId: document.root.nodeId,
			selector
		}, 10000).catch(() => null);
		if (!queried?.nodeId) {
			results.push({ selector, present: false });
			continue;
		}
		const described = await client.send("DOM.describeNode", {
			nodeId: queried.nodeId,
			depth: 1,
			pierce: true
		}, 10000);
		results.push({
			selector,
			present: true,
			nodeName: described.node?.nodeName ?? "",
			backendNodeId: described.node?.backendNodeId ?? null,
			attributes: attributeObject(described.node?.attributes ?? [])
		});
	}
	writeReport({ BH: "B\"H — Boruch Hashem — Blessed is He", results });
} finally {
	client.close();
}

async function ensureConversationTarget() {
	let targets = await targetInventory();
	let target = targets.find(entry => entry.type === "page" && entry.url.includes(conversationId));
	if (target?.webSocketDebuggerUrl) return target;
	const page = targets.find(entry => entry.type === "page" && entry.url.includes("chatgpt.com"));
	if (!page?.webSocketDebuggerUrl) throw new Error("No reusable ChatGPT target exists.");
	const client = new CdpClient(page.webSocketDebuggerUrl);
	await client.connect();
	try {
		await client.send("Page.navigate", {
			url: `${customGptUrl}/c/${encodeURIComponent(conversationId)}`
		}, 10000);
		await new Promise(resolve => setTimeout(resolve, 4000));
	} finally {
		client.close();
	}
	targets = await targetInventory();
	target = targets.find(entry => entry.type === "page" && entry.url.includes(conversationId));
	if (!target?.webSocketDebuggerUrl) throw new Error("Custom-GPT conversation target did not reopen.");
	return target;
}

async function targetInventory() {
	return (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json());
}

function attributeObject(values) {
	const result = {};
	for (let index = 0; index < values.length; index += 2) {
		const name = values[index];
		if (["id", "role", "contenteditable", "tabindex", "aria-label"].includes(name)) {
			result[name] = values[index + 1] ?? "";
		}
	}
	return result;
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/custom-gpt-composer-descendants.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
	console.log(JSON.stringify(value, null, 2));
}
