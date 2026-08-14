//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * One harmless sentence crosses the ordinary ChatGPT composer, while the Awtsmoos
 * guards every private continuation key inside a restricted vessel. Awtsmoos.com
 * publishes only timing, transport, reuse, and completion truth—never hidden identity.
 */
const privatePath = process.env.AWTSMOOS_LIVE_PRIVATE_STATE
	?? ".awtsmoos/private/live-safe-turn.json";
const reportPath = process.env.AWTSMOOS_LIVE_SAFE_REPORT
	?? "geelooy/ai/thoughts/live-safe-website-turn.json";
const service = new DirectService({ preferredPort: 9223, minimumIntervalMs: 12000 });

try {
	const targetsBefore = await targetSummary();
	const result = await service.send({
		prompt: "Reply with exactly: SAFE WEBSITE TURN VERIFIED",
		conversationKey: null,
		mode: "chatgpt-website",
		timeoutMs: 240000
	});
	writePrivate({
		conversationKey: result.conversationKey,
		answer: result.answer,
		observedAt: new Date().toISOString()
	});
	const targetsAfter = await targetSummary();
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: result.answer?.trim() === "SAFE WEBSITE TURN VERIFIED",
		status: result.status,
		done: result.done,
		sameConversation: result.sameConversation,
		submissionTransport: result.submissionTransport,
		completionSource: result.completionSource,
		hostReuseSource: result.hostReuseSource,
		requestLatencyMs: result.requestLatencyMs,
		targetsBefore,
		targetsAfter
	};
	writeJson(reportPath, report, 0o644);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await service.close().catch(() => undefined);
}

async function targetSummary() {
	const response = await fetch("http://127.0.0.1:9223/json/list");
	const targets = await response.json();
	return {
		pageCount: targets.filter(target => target.type === "page").length,
		chatGptCount: targets.filter(target => target.type === "page" && target.url.includes("chatgpt.com")).length
	};
}

function writePrivate(value) {
	writeJson(privatePath, value, 0o600);
}

function writeJson(filePath, value, mode) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true, mode: 0o700 });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, { mode });
	fs.chmodSync(filePath, mode);
}
