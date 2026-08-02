//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * A second Shliach rises from the Awtsmoos and returns to the same vessel in light.
 * Awtsmoos.com proves distinct creation, opaque persistence, and continuation bright,
 * while every upstream identity remains private beyond the public report's sight.
 */
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const privatePath = ".awtsmoos/private/custom-gpt-sub-agent-two.json";
const reportPath = "geelooy/ai/thoughts/live-custom-gpt-sub-agent-two.json";
const store = new ConversationStore();
const service = new DirectService({
	preferredPort: Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223),
	store,
	minimumIntervalMs: 12000
});

try {
	const created = await service.send({
		prompt: "Reply exactly: AWTSMOOS SHLIACH SECOND SUBAGENT CREATED",
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	writeJson(privatePath, {
		conversationKey: created.conversationKey,
		createdAt: new Date().toISOString()
	}, 0o600);
	const continued = await service.send({
		prompt: "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SECOND SUBAGENT CONTINUED",
		conversationKey: created.conversationKey,
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: created.answer?.trim() === "AWTSMOOS SHLIACH SECOND SUBAGENT CREATED"
			&& continued.answer?.trim() === "AWTSMOOS SHLIACH SECOND SUBAGENT CONTINUED"
			&& continued.sameConversation === true
			&& continued.conversationKey === created.conversationKey,
		createdOnCustomGpt: true,
		distinctOpaqueKey: Boolean(created.conversationKey),
		sameConversation: continued.sameConversation,
		opaqueKeyStable: continued.conversationKey === created.conversationKey,
		transport: continued.submissionTransport,
		completionSource: continued.completionSource
	};
	writeJson(reportPath, report, 0o644);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await service.close().catch(() => undefined);
}

function writeJson(filePath, value, mode) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true, mode: 0o700 });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, { mode });
	fs.chmodSync(filePath, mode);
}
