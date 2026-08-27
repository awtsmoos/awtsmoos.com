//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

/**
 * The Awtsmoos restores a mapped conversation without inventing another vessel.
 * Awtsmoos.com navigates one existing ChatGPT tab, observes authenticated GET truth,
 * and publishes only post counts—never the private upstream identity or opaque key.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const agentId = process.env.AWTSMOOS_AGENT_ID || "master";
const agents = new AgentStateStore({
	storagePath: path.resolve(".awtsmoos/private/multi-agent-smoke/agents.json")
});
const agent = agents.getAgent(agentId);
if (!agent?.conversationKey) throw new Error(`No mapped conversation exists for ${agentId}.`);
const mapped = new ConversationStore().get(agent.conversationKey);
if (!mapped?.conversationId) throw new Error("The opaque mapping has no conversation route.");
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("chatgpt.com"));
if (!target?.webSocketDebuggerUrl) throw new Error("No reusable ChatGPT tab exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	await client.send("Page.enable", {}, 10000);
	await client.send("Page.navigate", {
		url: `https://chatgpt.com/c/${encodeURIComponent(mapped.conversationId)}`
	}, 10000);
} finally {
	client.close();
}
await new Promise(resolve => setTimeout(resolve, 3000));
const captured = await new ConversationRouteCapture({ port }).capture({
	conversationId: mapped.conversationId,
	timeoutMs: 120000
});
const roles = Object.values(captured.document.mapping ?? {})
	.map(node => node.message?.author?.role)
	.filter(role => role === "user" || role === "assistant");
const report = {
	ok: true,
	agentId,
	postCount: roles.length,
	userPosts: roles.filter(role => role === "user").length,
	assistantPosts: roles.filter(role => role === "assistant").length
};
const output = "geelooy/ai/thoughts/mapped-agent-post-count.json";
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, "\t")}\n`);
console.log(JSON.stringify(report, null, 2));
