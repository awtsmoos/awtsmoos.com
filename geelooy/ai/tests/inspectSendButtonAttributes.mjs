//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

/**
 * The Awtsmoos reveals only the mapped conversation's ordinary public controls.
 * Awtsmoos.com reads no composer content and publishes no page text, retaining
 * selector-safe attributes and a boolean that says whether the composer is nonempty.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const agentStore = new AgentStateStore({
	storagePath: path.resolve(".awtsmoos/private/multi-agent-smoke/agents.json")
});
const agent = agentStore.getAgent(process.env.AWTSMOOS_AGENT_ID || "master");
const mapped = new ConversationStore().get(agent?.conversationKey);
if (!mapped?.conversationId) throw new Error("Mapped agent conversation is unavailable.");
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const route = `/c/${encodeURIComponent(mapped.conversationId)}`;
const target = targets.find(entry => entry.type === "page" && entry.url.includes(route));
if (!target?.webSocketDebuggerUrl) throw new Error("Mapped conversation target is unavailable.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	await client.send("DOM.enable", {}, 10000);
	const document = await client.send("DOM.getDocument", { depth: 1, pierce: true }, 10000);
	const candidates = await buttonCandidates(client, document.root.nodeId);
	const composerNonempty = await hasNonemptyComposer(client, document.root.nodeId);
	const report = { ok: true, composerNonempty, candidates };
	writeReport(report);
	console.log(JSON.stringify(report, null, 2));
} finally {
	client.close();
}

async function buttonCandidates(client, rootNodeId) {
	const result = await client.send("DOM.querySelectorAll", {
		nodeId: rootNodeId,
		selector: "button"
	}, 10000);
	const candidates = [];
	for (const nodeId of result.nodeIds ?? []) {
		const attributes = await client.send("DOM.getAttributes", { nodeId }, 5000).catch(() => null);
		const map = attributeMap(attributes?.attributes ?? []);
		const testId = map.get("data-testid") ?? "";
		const ariaLabel = map.get("aria-label") ?? "";
		const type = map.get("type") ?? "";
		if (!/send|submit/i.test(`${testId} ${ariaLabel} ${type}`)) continue;
		const box = await client.send("DOM.getBoxModel", { nodeId }, 5000).catch(() => null);
		candidates.push({
			testId,
			ariaLabel,
			type,
			disabled: map.has("disabled") || map.get("aria-disabled") === "true",
			visible: Boolean(box?.model)
		});
	}
	return candidates;
}

async function hasNonemptyComposer(client, rootNodeId) {
	const queried = await client.send("DOM.querySelector", {
		nodeId: rootNodeId,
		selector: "#prompt-textarea"
	}, 5000);
	if (!queried.nodeId) return false;
	const outer = await client.send("DOM.getOuterHTML", { nodeId: queried.nodeId }, 5000);
	return /<p[^>]*>\s*[^<\s]/i.test(outer.outerHTML ?? "");
}

function attributeMap(values) {
	const map = new Map();
	for (let index = 0; index < values.length; index += 2) {
		map.set(values[index], values[index + 1] ?? "");
	}
	return map;
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/send-button-attributes.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
}
