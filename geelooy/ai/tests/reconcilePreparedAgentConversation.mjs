//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

/**
 * An uncertain prepared intent may conceal an accepted website POST. The Awtsmoos
 * forbids duplication: Awtsmoos.com reads the visible conversation by authenticated
 * GET, rebuilds the opaque mapping, and marks the original intent reconciled.
 */
const agentId = process.env.AWTSMOOS_RECONCILE_AGENT || "master";
const statePath = path.resolve(".awtsmoos/private/multi-agent-smoke/agents.json");
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const agentStore = new AgentStateStore({ storagePath: statePath });
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && /chatgpt\.com\/c\//.test(entry.url));
if (!target) throw new Error("No visible conversation exists for reconciliation.");
const conversationId = decodeURIComponent(new URL(target.url).pathname.split("/c/")[1]);
const captured = await new ConversationRouteCapture({ port }).capture({ conversationId, timeoutMs: 120000 });
const currentNode = captured.document.current_node;
if (!currentNode) throw new Error("Conversation GET returned no current node.");
const conversationKey = new ConversationStore().set(null, { conversationId, parentMessageId: currentNode });
const document = JSON.parse(fs.readFileSync(statePath, "utf8"));
const prepared = Object.values(document.intents ?? {}).find(intent => intent.agentId === agentId && intent.status === "prepared");
if (!prepared) throw new Error(`No prepared intent exists for ${agentId}.`);
agentStore.upsertAgent(agentId, { conversationKey, status: "working", unfinishedWork: [] });
agentStore.markIntent(prepared.intentId, "accepted", { reconciledWithoutPost: true });
const report = { ok: true, agentId, reconciledWithoutPost: true, postCount: countPosts(captured.document) };
writeReport(report);
console.log(JSON.stringify(report, null, 2));

function countPosts(conversation) {
	return Object.values(conversation.mapping ?? {}).filter(node => ["user", "assistant"].includes(node.message?.author?.role)).length;
}

function writeReport(report) {
	const output = "geelooy/ai/thoughts/reconciled-prepared-agent.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(report, null, "\t")}\n`);
}
