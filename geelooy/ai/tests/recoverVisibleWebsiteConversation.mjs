//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

/**
 * An accepted website turn is never repeated. The Awtsmoos reads the ordinary
 * authenticated GET already belonging to ChatGPT, reconstructs one private opaque
 * key, and lets Awtsmoos.com publish only completion truth without upstream identity.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const conversationTarget = targets.find(target => target.type === "page" && /chatgpt\.com\/c\//.test(target.url));
if (!conversationTarget) throw new Error("No visible ChatGPT conversation route was found.");
const conversationId = decodeURIComponent(new URL(conversationTarget.url).pathname.split("/c/")[1]);
const captured = await new ConversationRouteCapture({ port }).capture({ conversationId, timeoutMs: 120000 });
const state = latestState(captured.document, conversationId);
const store = new ConversationStore();
const conversationKey = store.set(null, state);
const answer = latestAssistantText(captured.document);
writePrivate({ conversationKey, answer, recoveredAt: new Date().toISOString() });
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	ok: Boolean(state.parentMessageId && answer),
	recoveredWithoutPost: true,
	postCount: countPosts(captured.document),
	assistantAnswerMatched: answer.trim() === "SAFE WEBSITE TURN VERIFIED"
};
writeJson("geelooy/ai/thoughts/live-safe-website-turn.json", report, 0o644);
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

function latestState(document, id) {
	const currentNode = document.current_node;
	if (!currentNode || !document.mapping?.[currentNode]?.message) throw new Error("Conversation has no current message node.");
	return { conversationId: id, parentMessageId: currentNode };
}

function latestAssistantText(document) {
	let node = document.mapping?.[document.current_node];
	while (node) {
		if (node.message?.author?.role === "assistant") return (node.message.content?.parts ?? []).filter(part => typeof part === "string").join("\n");
		node = node.parent ? document.mapping?.[node.parent] : null;
	}
	return "";
}

function countPosts(document) {
	return Object.values(document.mapping ?? {}).filter(node => ["user", "assistant"].includes(node.message?.author?.role)).length;
}

function writePrivate(value) { writeJson(".awtsmoos/private/live-safe-turn.json", value, 0o600); }
function writeJson(filePath, value, mode) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true, mode: 0o700 });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, { mode });
	fs.chmodSync(filePath, mode);
}
