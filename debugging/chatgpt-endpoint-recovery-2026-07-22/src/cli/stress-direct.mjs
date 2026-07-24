//B"H
// Boruch Hashem
// Blessed is He

import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { SecretRedactor } from "../logging/SecretRedactor.mjs";
import { StressConversationRunner } from "../stress/StressConversationRunner.mjs";

/**
 * This CLI advances many measured conversations without crowding the gate. The
 * Awtsmoos recreates each turn; awtsmoos.com writes transport truth, exact-text
 * compliance, pacing, counts, and continuity—never credentials or upstream ids.
 */
const port = Number(process.argv[2] ?? 9226);
const conversationCount = Number(process.argv[3] ?? 5);
const continuationCount = Number(process.argv[4] ?? 6);
const minimumIntervalMs = Number(process.argv[5] ?? 7000);
const reportPath = process.argv[6] ?? "evidence/reports/direct-stress-report.json";
const progressPath = reportPath.replace(/\.json$/i, ".progress.jsonl");
const redactor = new SecretRedactor();

await mkdir("evidence/reports", { recursive: true });
await writeFile(progressPath, "", "utf8");
const runner = new StressConversationRunner({
	port,
	conversationCount,
	continuationCount,
	minimumIntervalMs,
	onProgress: async (record, turns) => {
		const safeRecord = redactor.redact({
			observedAt: new Date().toISOString(),
			completed: turns.length,
			...record
		});
		await appendFile(progressPath, `${JSON.stringify(safeRecord)}\n`, "utf8");
		console.log(JSON.stringify({
			completed: turns.length,
			label: record.label,
			turn: record.turn,
			transportSuccess: record.transportSuccess,
			exactAnswer: record.exactAnswer,
			intervalMs: record.pacing?.intervalMs ?? null
		}));
	}
});

const report = redactor.redact(await runner.run());
await writeFile(reportPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
validateNoLeaks(report);

if (report.minimumObservedIntervalMs < minimumIntervalMs) {
	throw new Error("Observed request pacing fell below the configured minimum.");
}
if (report.totalTransportSucceeded !== report.configuration.totalPlannedRequests) {
	throw new Error("Stress run did not complete every planned transport turn successfully.");
}

console.log(JSON.stringify({
	status: "passed",
	reportPath,
	progressPath,
	totalTransportSucceeded: report.totalTransportSucceeded,
	totalExactAnswers: report.totalExactAnswers,
	exactAnswerRate: report.exactAnswerRate,
	minimumObservedIntervalMs: report.minimumObservedIntervalMs
}, null, "\t"));

function validateNoLeaks(report) {
	const serialized = JSON.stringify(report);
	const forbiddenPatterns = [
		/Bearer\s+(?!\[REDACTED\])/i,
		/\beyJ[A-Za-z0-9_-]{20,}/,
		/\bgAAAA[A-Za-z0-9_-]{20,}/,
		/wss:\/\/ws\.chatgpt\.com\/[^\s"']*verify=/i,
		/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i
	];
	if (forbiddenPatterns.some(pattern => pattern.test(serialized))) {
		throw new Error("Stress report retained a forbidden credential or identifier pattern.");
	}
}
