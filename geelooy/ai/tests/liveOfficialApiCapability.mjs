//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * Capability reads server configuration only. The Awtsmoos lets Awtsmoos.com
 * prove strict request-only readiness without Chrome, DOM, provider requests,
 * credential output, response ids, account data, or browser enforcement state.
 */
const outputPath = process.env.AWTSMOOS_CAPABILITY_REPORT
	?? "geelooy/ai/thoughts/live-official-api-capability.json";
const service = new DirectService();

try {
	const capability = await service.capability();
	validate(capability);
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		observedAt: new Date().toISOString(),
		...capability
	}, null, "\t")}\n`);
	console.log(JSON.stringify({
		status: capability.strictChatReady ? "ready" : "configuration-required",
		outputPath,
		transport: capability.transport,
		officialApiConfigured: capability.officialApiConfigured,
		browserRequired: capability.browserRequired,
		browserInspected: capability.browserInspected,
		domUsed: capability.composerTouched,
		failureCode: capability.failureCode
	}, null, 2));
	if (!capability.strictChatReady) process.exitCode = 2;
} finally {
	await service.close().catch(() => undefined);
}

function validate(value) {
	const required = [
		value.ok === true,
		value.mode === "strict-request-only",
		value.transport === "official-responses-api",
		value.browserRequired === false,
		value.browserInspected === false,
		value.composerTouched === false,
		value.conversationPostSent === false,
		value.socketRequired === false
	];
	if (required.includes(false)) {
		throw new Error("Official API capability violated the zero-DOM contract.");
	}
	const serialized = JSON.stringify(value);
	if (/Bearer\s|\bsk-[A-Za-z0-9_-]+|resp_[A-Za-z0-9_-]+/i.test(serialized)) {
		throw new Error("Official API capability retained a private value.");
	}
}
