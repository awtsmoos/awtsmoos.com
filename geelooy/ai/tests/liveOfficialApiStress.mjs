//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";
import { OfficialApiStressRunner } from "../relay/direct/stress/OfficialApiStressRunner.mjs";

const conversations = Number(process.env.AWTSMOOS_STRESS_CONVERSATIONS || 4);
const messages = Number(process.env.AWTSMOOS_STRESS_MESSAGES || 5);
const minimumIntervalMs = Math.max(
	10000,
	Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000)
);
const outputPath = process.env.AWTSMOOS_STRESS_REPORT
	?? "geelooy/ai/thoughts/live-official-api-4x5.json";
const eventPath = process.env.AWTSMOOS_STRESS_EVENTS
	?? "/tmp/awtsmoos-official-api-stress.jsonl";
const lockPath = process.env.AWTSMOOS_STRESS_LOCK
	?? "/tmp/awtsmoos-official-api-stress.lock";

acquireLock(lockPath);
const service = new DirectService({ minimumIntervalMs });
const append = value => fs.appendFileSync(eventPath, `${JSON.stringify(value)}\n`);

try {
	const capability = await service.capability();
	if (!capability.officialApiConfigured) {
		const error = new Error("OPENAI_API_KEY is required for official API stress.");
		error.code = "official_api_key_required";
		throw error;
	}
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	append({
		type: "start",
		startedAt: new Date().toISOString(),
		conversations,
		messages,
		minimumIntervalMs,
		transport: "official-responses-api",
		browserUsed: false,
		domUsed: false
	});
	const report = await new OfficialApiStressRunner({
		service,
		conversations,
		messages,
		minimumIntervalMs,
		onEvent: append
	}).run();
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	append({
		type: "success",
		finishedAt: new Date().toISOString(),
		succeeded: report.succeeded,
		createdConversations: report.createdConversations,
		minimumObservedIntervalMs: report.minimumObservedIntervalMs,
		outputPath
	});
	console.log(JSON.stringify({
		status: "passed",
		outputPath,
		succeeded: report.succeeded,
		createdConversations: report.createdConversations,
		browserUsed: report.browserUsed,
		domUsed: report.domUsed
	}, null, 2));
} catch (error) {
	append({
		type: "failure",
		failedAt: new Date().toISOString(),
		code: error?.code || "official_api_stress_failed",
		message: String(error?.message || error).slice(0, 240)
	});
	throw error;
} finally {
	await service.close().catch(() => undefined);
	fs.rmSync(lockPath, { recursive: true, force: true });
}

function acquireLock(value) {
	try {
		fs.mkdirSync(value);
	} catch (error) {
		if (error?.code === "EEXIST") {
			throw new Error("An official API stress run is already active.");
		}
		throw error;
	}
}
