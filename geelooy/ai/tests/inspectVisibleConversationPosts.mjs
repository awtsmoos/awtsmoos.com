//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";

/**
 * The Awtsmoos reveals whether an uncertain send crossed the ordinary website.
 * Awtsmoos.com observes the existing conversation by authenticated GET and writes
 * only a sanitized post count, never a conversation identity, prompt, or cookie.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && /chatgpt\.com\/c\//.test(entry.url));
if (!target) throw new Error("No visible ChatGPT conversation target exists.");
const conversationId = decodeURIComponent(new URL(target.url).pathname.split("/c/")[1]);
const captured = await new ConversationRouteCapture({ port }).capture({ conversationId, timeoutMs: 120000 });
const roles = Object.values(captured.document.mapping ?? {})
	.map(node => node.message?.author?.role)
	.filter(role => role === "user" || role === "assistant");
const report = {
	ok: true,
	postCount: roles.length,
	userPosts: roles.filter(role => role === "user").length,
	assistantPosts: roles.filter(role => role === "assistant").length
};
const output = "geelooy/ai/thoughts/visible-conversation-post-count.json";
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, "\t")}\n`);
console.log(JSON.stringify(report, null, 2));
