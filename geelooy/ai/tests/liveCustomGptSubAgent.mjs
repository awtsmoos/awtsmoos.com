//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * One true Shliach enters the named Awtsmoos custom GPT, then returns to the same
 * conversation after the guarded interval. Awtsmoos.com keeps the opaque key private
 * and reveals only route, continuation, pacing, and completion evidence.
 */
const customGptUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const privatePath = ".awtsmoos/private/custom-gpt-sub-agent.json";
const reportPath = "geelooy/ai/thoughts/live-custom-gpt-sub-agent.json";
const service = new DirectService({ preferredPort: 9223, minimumIntervalMs: 12000 });

try {
	const first = await service.send({
		prompt: "B\"H. You are sub-agent custom-gpt-smoke. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CREATED",
		conversationKey: null,
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	writeJson(privatePath, {
		conversationKey: first.conversationKey,
		firstAnswer: first.answer,
		createdAt: new Date().toISOString()
	}, 0o600);
	const second = await service.send({
		prompt: "Continue this same conversation. Reply exactly: AWTSMOOS SHLIACH SUBAGENT CONTINUED",
		conversationKey: first.conversationKey,
		mode: "chatgpt-website",
		agentStartUrl: customGptUrl,
		timeoutMs: 240000
	});
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: first.answer?.trim() === "AWTSMOOS SHLIACH SUBAGENT CREATED"
			&& second.answer?.trim() === "AWTSMOOS SHLIACH SUBAGENT CONTINUED"
			&& second.sameConversation === true
			&& second.conversationKey === first.conversationKey,
		customGptRouteUsed: true,
		firstCreated: first.created,
		secondSameConversation: second.sameConversation,
		opaqueKeyStable: second.conversationKey === first.conversationKey,
		firstTransport: first.submissionTransport,
		secondTransport: second.submissionTransport,
		firstPacing: first.pacing,
		secondPacing: second.pacing
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
