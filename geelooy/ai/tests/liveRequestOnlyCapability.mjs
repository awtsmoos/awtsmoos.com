//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { RequestOnlyCapabilityService } from "../relay/direct/chatgpt/RequestOnlyCapabilityService.mjs";

/**
 * The Awtsmoos reveals the production relay's strict request-only boundary in a
 * live authenticated browser. Awtsmoos.com persists capability booleans only—no
 * conduit, Sentinel, account, proof, session, socket, or upstream identity value.
 */
const outputPath = process.env.AWTSMOOS_CAPABILITY_REPORT
	?? "geelooy/ai/thoughts/live-request-only-capability.json";
const preferredPort = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9226);
const service = new RequestOnlyCapabilityService({ preferredPort });
const capability = await service.inspect();
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	observedAt: new Date().toISOString(),
	...capability
};

validate(report);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
console.log(JSON.stringify({
	status: "passed",
	outputPath,
	strictChatReady: report.strictChatReady,
	fallbackRequired: report.fallbackRequired,
	enforcementRequired: report.enforcementRequired
}, null, "\t"));

function validate(value) {
	const expectations = [
		[value.ok === true, "Capability service did not report ok."],
		[value.mode === "strict-request-only", "Capability mode was not strict."],
		[value.authenticated === true, "Settings host was not authenticated."],
		[value.topicSocketOpen === true, "Topic socket was not open."],
		[value.composerTouched === false, "Capability run touched the composer."],
		[value.conversationPostSent === false, "Capability run sent a conversation POST."],
		[value.conversationPrepare?.ready === true, "Conversation prepare was not ready."],
		[value.sentinelPrepare?.ready === true, "Sentinel prepare was not ready."],
		[value.sentinelSdk?.ready === true, "Sentinel SDK token was not ready."],
		[value.enforcementRequired === true, "Normal enforcement was not reported."],
		[value.strictChatReady === false, "Strict chat was incorrectly marked ready."],
		[value.fallbackRequired === true, "Fallback requirement was not reported."]
	];
	const failure = expectations.find(([passed]) => !passed);
	if (failure) throw new Error(failure[1]);

	const serialized = JSON.stringify(value);
	const forbidden = [
		/Bearer\s+[A-Za-z0-9._-]{20,}/i,
		/\beyJ[A-Za-z0-9_-]{20,}/,
		/\bgAAAA[A-Za-z0-9_-]{20,}/,
		/wss:\/\/ws\.chatgpt\.com\/[^\s"']+/i,
		/prepare_token\"\s*:\s*\"/i,
		/conduit_token\"\s*:\s*\"/i,
		/proofToken\"\s*:\s*\"/i,
		/turnstileToken\"\s*:\s*\"/i
	];
	if (forbidden.some(pattern => pattern.test(serialized))) {
		throw new Error("Live capability report retained a forbidden secret value.");
	}
}
