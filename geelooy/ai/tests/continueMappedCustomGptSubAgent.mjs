//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * The Awtsmoos preserves one opaque local key across every storm. Awtsmoos.com loads
 * the already-recovered mapping and continues the same custom-GPT conversation once,
 * without rebuilding identity through a fragile preliminary route observation.
 */
const privatePath = ".awtsmoos/private/custom-gpt-sub-agent.json";
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const privateState = JSON.parse(fs.readFileSync(privatePath, "utf8"));
if (!privateState.conversationKey) throw new Error("The private opaque conversation key is missing.");
const store = new ConversationStore();
if (!store.get(privateState.conversationKey)) {
	throw new Error("The opaque conversation mapping is unavailable in the private store.");
}
const service = new DirectService({
	preferredPort: Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223),
	store,
	minimumIntervalMs: 12000
});
try {
	const continued = await service.send({
		prompt: "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CONTINUED",
		conversationKey: privateState.conversationKey,
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: continued.answer?.trim() === "AWTSMOOS SHLIACH SUBAGENT CONTINUED"
			&& continued.sameConversation === true
			&& continued.conversationKey === privateState.conversationKey,
		sameConversation: continued.sameConversation,
		opaqueKeyStable: continued.conversationKey === privateState.conversationKey,
		transport: continued.submissionTransport,
		completionSource: continued.completionSource
	};
	writeReport(report);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await service.close().catch(() => undefined);
}

function writeReport(value) {
	const filePath = "geelooy/ai/thoughts/live-custom-gpt-sub-agent.json";
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`);
}
