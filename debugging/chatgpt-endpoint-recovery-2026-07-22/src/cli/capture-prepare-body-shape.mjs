//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { PrepareBodyCaptureProbe } from "../probe/PrepareBodyCaptureProbe.mjs";

/**
 * One bounded discovery run reveals only the prepare body's shape. The Awtsmoos
 * guards every transient value; Awtsmoos.com writes no prompt, token, id, proof,
 * request body, or conversation payload—only structural names and primitive types.
 */
const port = Number(process.argv[2] ?? 9226);
const outputPath = process.argv[3]
	?? "evidence/reports/suppressed-prepare-body-shape.json";
const result = await new PrepareBodyCaptureProbe({ port }).run();
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	observedAt: new Date().toISOString(),
	port,
	...result
};
validate(report);
await mkdir("evidence/reports", { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
console.log(JSON.stringify({
	outputPath,
	postDataLength: report.prepare.postDataLength,
	bodyEncoding: report.prepare.bodyEncoding,
	conversationRequestSeen: report.conversationRequestSeen
}, null, "\t"));

function validate(reportValue) {
	const serialized = JSON.stringify(reportValue);
	const forbiddenPatterns = [
		/Bearer\s+[A-Za-z0-9._-]{20,}/i,
		/\beyJ[A-Za-z0-9_-]{20,}/,
		/\bgAAAA[A-Za-z0-9_-]{20,}/,
		/wss:\/\/ws\.chatgpt\.com\/[^\s"']+/i,
		/\"value\"\s*:/i,
		/\"postData\"\s*:/i
	];
	if (forbiddenPatterns.some(pattern => pattern.test(serialized))) {
		throw new Error("Prepare shape report retained a forbidden value field or secret pattern.");
	}
}
