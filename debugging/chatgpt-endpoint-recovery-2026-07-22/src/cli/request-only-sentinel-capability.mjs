//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { RequestOnlyHostController } from "../browser/RequestOnlyHostController.mjs";
import { RequestOnlyPrepareClient } from "../chatgpt/RequestOnlyPrepareClient.mjs";
import { RequestOnlySentinelPrepareClient } from "../chatgpt/RequestOnlySentinelPrepareClient.mjs";
import { RequestOnlySentinelSdkClient } from "../chatgpt/RequestOnlySentinelSdkClient.mjs";

/**
 * The Awtsmoos reveals the exact request-only boundary without crossing it.
 * Awtsmoos.com prepares a conduit, asks Sentinel for challenge requirements, and
 * invokes only the normal public SDK; no finalize or conversation POST is sent.
 */
const port = Number(process.argv[2] ?? 9226);
const outputPath = process.argv[3]
	?? "evidence/reports/request-only-sentinel-capability.json";
const host = await new RequestOnlyHostController({ port }).open();

try {
	const prepare = await new RequestOnlyPrepareClient(host.cdpClient).prepare({
		applicationHeaders: host.applicationHeaders
	});
	const sentinel = await new RequestOnlySentinelPrepareClient(host.cdpClient).prepare({
		applicationHeaders: host.applicationHeaders
	});
	const sdk = await new RequestOnlySentinelSdkClient(host.cdpClient).createToken();
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		observedAt: new Date().toISOString(),
		port,
		route: host.pageState.url,
		requestOnly: true,
		composerTouched: false,
		finalizeSent: false,
		conversationPostSent: false,
		conversationPrepare: {
			status: prepare.status,
			hasConduitToken: typeof prepare.conduitToken === "string",
			conduitTokenLength: prepare.conduitToken.length
		},
		sentinelPrepare: {
			status: sentinel.status,
			responseKeys: sentinel.responseKeys,
			prepareTokenPresent: sentinel.prepareTokenPresent,
			prepareTokenLength: sentinel.prepareTokenLength,
			turnstileRequired: sentinel.turnstileRequired,
			proofOfWorkRequired: sentinel.proofOfWorkRequired,
			sessionObserverRequired: sentinel.sessionObserverRequired,
			forceLogin: sentinel.forceLogin,
			personaType: sentinel.personaType
		},
		sentinelSdk: {
			methodNames: sdk.methodNames,
			hasInit: sdk.hasInit,
			hasToken: sdk.hasToken,
			hasTiming: sdk.hasTiming,
			tokenPresent: typeof sdk.token === "string",
			tokenLength: sdk.token.length,
			timingPresent: sdk.timing != null,
			timingType: typeof sdk.timing
		},
		boundary: sentinel.turnstileRequired || sentinel.proofOfWorkRequired
			? "chat-requirements-finalization-requires-normal-enforcement"
			: "request-only-finalization-may-be-possible"
	};
	validate(report);
	await mkdir("evidence/reports", { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
	console.log(JSON.stringify({
		outputPath,
		prepareStatus: prepare.status,
		sentinelStatus: sentinel.status,
		boundary: report.boundary
	}, null, "\t"));
} finally {
	await host.close();
}

function validate(value) {
	const serialized = JSON.stringify(value);
	if (/Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|prepare_token\"\s*:\s*\"|conduitToken\"\s*:\s*\"/i.test(serialized)) {
		throw new Error("Sentinel capability report retained a forbidden secret value.");
	}
}
