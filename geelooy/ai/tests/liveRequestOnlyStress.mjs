//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";
import { RequestOnlyStressRunner } from "../relay/direct/stress/RequestOnlyStressRunner.mjs";

const conversations = Number(process.env.AWTSMOOS_STRESS_CONVERSATIONS || 4);
const messages = Number(process.env.AWTSMOOS_STRESS_MESSAGES || 5);
const minimumIntervalMs = Math.max(10000, Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000));
const outputPath = process.env.AWTSMOOS_STRESS_REPORT
	?? "geelooy/ai/thoughts/live-request-only-4x5.json";
const eventPath = process.env.AWTSMOOS_STRESS_EVENTS
	?? "/tmp/awtsmoos-request-only-stress.jsonl";
const lockPath = process.env.AWTSMOOS_STRESS_LOCK
	?? "/tmp/awtsmoos-request-only-stress.lock";

acquireLock(lockPath);
const service = new DirectService({ minimumIntervalMs });
const append = value => fs.appendFileSync(eventPath, `${JSON.stringify(value)}\n`);

try {
	const capability = await service.capability();
	if (!capability.strictChatReady) {
		const error = new Error("No strict request-only provider is available.");
		error.code = "request_only_provider_unavailable";
		throw error;
	}
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	append({
		type: "start",
		startedAt: new Date().toISOString(),
		conversations,
		messages,
		minimumIntervalMs,
		transport: capability.transport,
		browserUsed: false,
		domUsed: false
	});
	const report = await new RequestOnlyStressRunner({
		service,
		conversations,
		messages,
		minimumIntervalMs,
		onEvent: append
	}).run();
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	append({ type: "success", finishedAt: new Date().toISOString(), outputPath });
	console.log(JSON.stringify({
		status: "passed",
		outputPath,
		succeeded: report.succeeded,
		createdConversations: report.createdConversations,
		completionSources: report.completionSources,
		browserUsed: false,
		domUsed: false
	}, null, 2));
} catch (error) {
	append({
		type: "failure",
		failedAt: new Date().toISOString(),
		code: error?.code || "request_only_stress_failed",
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
		if (error?.code === "EEXIST") throw new Error("A request-only stress run is active.");
		throw error;
	}
}
