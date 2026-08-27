//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * The accepted Shliach turn is never repeated. The Awtsmoos reopens the exact private
 * custom-GPT conversation, Awtsmoos.com reads authenticated GET state, restores the
 * opaque key, then sends one continuation inside that same conversation.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const pendingConversationId = process.env.AWTSMOOS_PENDING_CONVERSATION_ID || null;
const inventory = await targetInventory();
let target = customConversationTarget(inventory);
let conversationId = target ? conversationIdFromUrl(target.url) : pendingConversationId;
if (!conversationId) throw new Error("No accepted custom-GPT conversation identity was available.");
if (!target) target = await reopenConversation(inventory, conversationId);
const capture = new ConversationRouteCapture({ port });
const recovered = await capture.capture({ conversationId, timeoutMs: 120000 });
const parentMessageId = recovered.document.current_node;
if (!parentMessageId) throw new Error("Recovered conversation has no current node.");
const store = new ConversationStore();
const conversationKey = store.set(null, { conversationId, parentMessageId });
const firstAnswer = latestAssistantText(recovered.document);
writeJson(".awtsmoos/private/custom-gpt-sub-agent.json", {
	conversationKey,
	firstAnswer,
	recoveredAt: new Date().toISOString()
}, 0o600);
const service = new DirectService({ preferredPort: port, store, minimumIntervalMs: 12000 });
try {
	const continued = await service.send({
		prompt: "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CONTINUED",
		conversationKey,
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: firstAnswer.trim() === "AWTSMOOS SHLIACH SUBAGENT CREATED"
			&& continued.answer?.trim() === "AWTSMOOS SHLIACH SUBAGENT CONTINUED"
			&& continued.sameConversation === true
			&& continued.conversationKey === conversationKey,
		customGptRouteRecovered: true,
		recoveredWithoutPost: true,
		opaqueKeyStable: continued.conversationKey === conversationKey,
		sameConversation: continued.sameConversation,
		continuationTransport: continued.submissionTransport,
		postCountBeforeContinuation: countPosts(recovered.document)
	};
	writeJson("geelooy/ai/thoughts/live-custom-gpt-sub-agent.json", report, 0o644);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await service.close().catch(() => undefined);
}

async function targetInventory() {
	return (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json());
}

function customConversationTarget(targets) {
	return targets.find(entry => entry.type === "page" && entry.url.includes("/g/") && entry.url.includes("/c/"));
}

function conversationIdFromUrl(url) {
	const segments = new URL(url).pathname.split("/").filter(Boolean);
	return segments[segments.lastIndexOf("c") + 1] || null;
}

async function reopenConversation(targets, id) {
	const page = targets.find(entry => entry.type === "page" && entry.url.includes("chatgpt.com"));
	if (!page?.webSocketDebuggerUrl) throw new Error("No reusable ChatGPT target was available.");
	const client = new CdpClient(page.webSocketDebuggerUrl);
	await client.connect();
	try {
		await client.send("Page.navigate", { url: `${customGptUrl}/c/${encodeURIComponent(id)}` }, 10000);
		await new Promise(resolve => setTimeout(resolve, 2500));
	} finally {
		client.close();
	}
	return page;
}

function latestAssistantText(document) {
	let node = document.mapping?.[document.current_node];
	while (node) {
		if (node.message?.author?.role === "assistant") {
			return (node.message.content?.parts ?? []).filter(part => typeof part === "string").join("\n");
		}
		node = node.parent ? document.mapping?.[node.parent] : null;
	}
	return "";
}

function countPosts(document) {
	return Object.values(document.mapping ?? {}).filter(node => ["user", "assistant"].includes(node.message?.author?.role)).length;
}

function writeJson(filePath, value, mode) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true, mode: 0o700 });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, { mode });
	fs.chmodSync(filePath, mode);
}
