//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { RequestOnlyHostController } from "../browser/RequestOnlyHostController.mjs";
import { RequestOnlyPrepareClient } from "../chatgpt/RequestOnlyPrepareClient.mjs";

/**
 * The Awtsmoos opens a settings-hosted request vessel and performs prepare with
 * no composer. Awtsmoos.com records only status, field names, and token presence;
 * the conduit token and parent identity vanish when this process closes.
 */
const port = Number(process.argv[2] ?? 9226);
const outputPath = process.argv[3]
	?? "evidence/reports/request-only-prepare-live.json";
const controller = await new RequestOnlyHostController({ port }).open();

try {
	const result = await new RequestOnlyPrepareClient(controller.cdpClient).prepare({
		applicationHeaders: controller.applicationHeaders
	});
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		observedAt: new Date().toISOString(),
		port,
		route: controller.pageState.url,
		requestOnly: true,
		composerVisible: controller.pageState.composerVisible,
		conversationPostSent: false,
		prepare: {
			status: result.status,
			contentType: result.contentType,
			responseKeys: result.responseKeys,
			bodyFields: result.bodyFields,
			forwardedHeaderNames: result.forwardedHeaderNames,
			hasConduitToken: typeof result.conduitToken === "string",
			conduitTokenLength: result.conduitToken.length,
			hasParentMessageId: typeof result.parentMessageId === "string"
		}
	};
	validate(report);
	await mkdir("evidence/reports", { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
	console.log(JSON.stringify({
		outputPath,
		status: result.status,
		hasConduitToken: true
	}, null, "\t"));
} finally {
	await controller.close();
}

function validate(value) {
	const serialized = JSON.stringify(value);
	if (/Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|conduitToken\"\s*:\s*\"/i.test(serialized)) {
		throw new Error("Request-only prepare report retained a forbidden secret value.");
	}
}
