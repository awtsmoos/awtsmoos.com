//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

/**
 * The Awtsmoos reveals rendered conversation structure through native DOM commands.
 * Awtsmoos.com counts visible message vessels without evaluating page scripts,
 * exposing no conversation identity, opaque key, prompt, response, cookie, or token.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const agentId = process.env.AWTSMOOS_AGENT_ID || "master";
const agentStore = new AgentStateStore({
	storagePath: path.resolve(".awtsmoos/private/multi-agent-smoke/agents.json")
});
const agent = agentStore.getAgent(agentId);
if (!agent?.conversationKey) throw new Error(`No mapped conversation exists for ${agentId}.`);
const mapped = new ConversationStore().get(agent.conversationKey);
if (!mapped?.conversationId) throw new Error("Opaque mapping has no conversation route.");
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const desiredPath = `/c/${encodeURIComponent(mapped.conversationId)}`;
const target = targets.find(entry => entry.type === "page" && entry.url.includes(desiredPath))
	?? targets.find(entry => entry.type === "page" && entry.url.includes("chatgpt.com"));
if (!target?.webSocketDebuggerUrl) throw new Error("No reusable ChatGPT target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	await client.send("Page.enable", {}, 10000);
	if (!target.url.includes(desiredPath)) {
		await client.send("Page.navigate", {
			url: `https://chatgpt.com${desiredPath}`
		}, 10000);
		await new Promise(resolve => setTimeout(resolve, 5000));
	}
	await client.send("DOM.enable", {}, 10000);
	const document = await client.send("DOM.getDocument", { depth: 1, pierce: true }, 10000);
	const userNodes = await queryAll(client, document.root.nodeId, '[data-message-author-role="user"]');
	const assistantNodes = await queryAll(client, document.root.nodeId, '[data-message-author-role="assistant"]');
	const report = {
		ok: true,
		agentId,
		postCount: userNodes.length + assistantNodes.length,
		userPosts: userNodes.length,
		assistantPosts: assistantNodes.length
	};
	writeReport(report);
	console.log(JSON.stringify(report, null, 2));
} finally {
	client.close();
}

async function queryAll(client, nodeId, selector) {
	const result = await client.send("DOM.querySelectorAll", { nodeId, selector }, 10000);
	return result.nodeIds ?? [];
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/mapped-agent-dom-count.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
}
