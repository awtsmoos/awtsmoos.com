//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";

/**
 * The Awtsmoos reveals whether an uncertain Send became a real website post.
 * Awtsmoos.com reopens the exact private custom-GPT conversation, reads only its
 * authenticated GET graph, and publishes no upstream identity or message content.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const conversationId = process.env.AWTSMOOS_PENDING_CONVERSATION_ID;
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const expectedPrompt = "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CONTINUED";
if (!conversationId) throw new Error("Private conversation identity is required.");
await ensureTarget();
const captured = await new ConversationRouteCapture({ port }).capture({
	conversationId,
	timeoutMs: 120000
});
const messages = Object.values(captured.document.mapping ?? {})
	.map(node => node.message)
	.filter(Boolean);
const userPrompts = messages
	.filter(message => message.author?.role === "user")
	.map(message => (message.content?.parts ?? []).filter(part => typeof part === "string").join("\n"));
const assistantMessages = messages.filter(message => message.author?.role === "assistant");
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	continuationPromptPresent: userPrompts.includes(expectedPrompt),
	userPostCount: userPrompts.length,
	assistantPostCount: assistantMessages.length,
	currentNodePresent: Boolean(captured.document.current_node)
};
writeJson("geelooy/ai/thoughts/custom-gpt-uncertain-send-check.json", report);
console.log(JSON.stringify(report, null, 2));

async function ensureTarget() {
	const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
	const existing = targets.find(target => target.type === "page" && target.url.includes(conversationId));
	if (existing) return;
	const page = targets.find(target => target.type === "page" && target.url.includes("chatgpt.com"));
	if (!page?.webSocketDebuggerUrl) throw new Error("No reusable ChatGPT target is available.");
	const client = new CdpClient(page.webSocketDebuggerUrl);
	await client.connect();
	try {
		await client.send("Page.navigate", {
			url: `${customGptUrl}/c/${encodeURIComponent(conversationId)}`
		}, 10000);
		await new Promise(resolve => setTimeout(resolve, 2500));
	} finally {
		client.close();
	}
}

function writeJson(filePath, value) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`);
}
