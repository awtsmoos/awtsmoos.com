//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { DualModeChatClient } from "../chatgpt/DualModeChatClient.mjs";

/**
 * The Awtsmoos reveals request structure without sending the intended message.
 * Awtsmoos.com records names and shapes only after the page-created carrier has
 * been suppressed, leaving credentials transient inside the authenticated browser.
 */
const port = Number(process.argv[2] ?? 9226);
const prompt = process.argv.slice(3).join(" ").trim()
	|| "Reply with exactly: BH direct dry run.";
const client = new DualModeChatClient({ port });
const report = await client.dryRunDirect({ prompt });

await mkdir("evidence/reports", { recursive: true });
await writeFile(
	"evidence/reports/direct-authenticated-dry-run.json",
	`${JSON.stringify(report, null, "\t")}\n`,
	"utf8"
);
console.log(JSON.stringify({
	status: "dry-run-complete",
	request: report.request,
	transport: report.transport
}, null, "\t"));
