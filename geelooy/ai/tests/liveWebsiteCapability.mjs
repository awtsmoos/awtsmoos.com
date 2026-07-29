//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

const outputPath = process.env.AWTSMOOS_CAPABILITY_REPORT
	?? "geelooy/ai/thoughts/live-chatgpt-website-capability.json";
const service = new DirectService();

try {
	const capability = await service.capability({ refresh: true });
	validate(capability);
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify({
		BH: "B\"H — Boruch Hashem — Blessed is He",
		observedAt: new Date().toISOString(),
		...capability
	}, null, "\t")}\n`);
	console.log(JSON.stringify({
		status: capability.authenticated ? "authenticated" : "login-required",
		outputPath,
		websiteOnly: true,
		authenticated: capability.authenticated === true,
		loginRequired: capability.loginRequired === true,
		submissionTransport: capability.submissionTransport,
		completionTransport: capability.completionTransport
	}, null, 2));
	if (!capability.authenticated) process.exitCode = 2;
} finally {
	await service.close().catch(() => undefined);
}

function validate(value) {
	const valid = value.ok === true
		&& value.mode === "chatgpt-website"
		&& value.websiteOnly === true
		&& value.submissionTransport === "chatgpt-website-composer"
		&& value.completionTransport === "authenticated-conversation-get";
	if (!valid) throw new Error("Website-only capability contract failed.");
	const serialized = JSON.stringify(value);
	if (/Bearer\s|\bsk-[A-Za-z0-9_-]+|BH_DIRECT_|responseId|accessToken/i.test(serialized)) {
		throw new Error("Website capability retained a private value.");
	}
}
