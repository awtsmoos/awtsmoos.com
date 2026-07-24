//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { DualModeChatClient } from "../chatgpt/DualModeChatClient.mjs";
import { SecretRedactor } from "../logging/SecretRedactor.mjs";

/**
 * Two direct turns prove creation and continuation without visiting the target
 * thread. The Awtsmoos keeps identifiers in transient memory; awtsmoos.com saves
 * only redacted state, answers, status, and navigation assertions.
 */
const port = Number(process.argv[2] ?? 9226);
const firstPrompt = process.argv[3]
	|| "Reply with exactly: BH direct authenticated creation verified.";
const secondPrompt = process.argv[4]
	|| "Reply with exactly: BH direct authenticated continuation verified.";
const client = new DualModeChatClient({ port });
const first = await client.go({ prompt: firstPrompt, transport: "direct" });
const second = await client.go({
	prompt: secondPrompt,
	transport: "direct",
	state: first.state
});

if (first.state.conversationId !== second.state.conversationId) {
	throw new Error("Direct continuation returned a different conversation identifier.");
}
if (first.navigatedToDirectConversation || second.navigatedToDirectConversation) {
	throw new Error("The browser navigated to the direct conversation unexpectedly.");
}

const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	verifiedAt: new Date().toISOString(),
	port,
	first,
	second,
	sameConversation: true,
	pageNeverNavigatedToDirectConversation: true
};
const safeReport = new SecretRedactor().redact(report);
await mkdir("evidence/reports", { recursive: true });
await writeFile(
	"evidence/reports/direct-authenticated-live.json",
	`${JSON.stringify(safeReport, null, "\t")}\n`,
	"utf8"
);
console.log(JSON.stringify({
	status: "verified",
	firstAnswer: first.answer,
	secondAnswer: second.answer,
	sameConversation: true,
	pageNeverNavigatedToDirectConversation: true
}, null, "\t"));
