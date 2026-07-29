//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * Capability probes only native HTTP providers: server-side OpenAI configuration
 * and localhost model health. The Awtsmoos touches no Chrome, DOM, composer,
 * browser session, provider response, credential value, transcript, or model input.
 */
const outputPath = process.env.AWTSMOOS_CAPABILITY_REPORT
	?? "geelooy/ai/thoughts/live-request-only-capability.json";
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
		status: capability.strictChatReady ? "ready" : "provider-required",
		outputPath,
		transport: capability.transport,
		browserRequired: capability.browserRequired,
		browserInspected: capability.browserInspected,
		domUsed: capability.composerTouched,
		officialApiConfigured: capability.officialApi?.configured === true,
		localModelConfigured: capability.localModel?.configured === true,
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
		value.browserRequired === false,
		value.browserInspected === false,
		value.composerTouched === false,
		value.conversationPostSent === false,
		value.socketRequired === false
	];
	if (required.includes(false)) {
		throw new Error("Request-only capability violated the zero-browser contract.");
	}
	const serialized = JSON.stringify(value);
	if (/Bearer\s|\bsk-[A-Za-z0-9_-]+|resp_[A-Za-z0-9_-]+|BH_DIRECT_/i.test(serialized)) {
		throw new Error("Request-only capability retained a private value.");
	}
}
