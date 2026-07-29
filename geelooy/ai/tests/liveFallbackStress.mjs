//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";
import { AuthenticatedConversationCounter } from "../relay/direct/stress/AuthenticatedConversationCounter.mjs";
import { FallbackStressRunner } from "../relay/direct/stress/FallbackStressRunner.mjs";

const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const conversations = Number(process.env.AWTSMOOS_STRESS_CONVERSATIONS || 4);
const messages = Number(process.env.AWTSMOOS_STRESS_MESSAGES || 5);
const minimumIntervalMs = Math.max(
	10000,
	Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000)
);
const outputPath = process.env.AWTSMOOS_STRESS_REPORT
	?? "geelooy/ai/thoughts/live-chatgpt-website-4x5.json";
const eventPath = process.env.AWTSMOOS_STRESS_EVENTS
	?? "/tmp/awtsmoos-chatgpt-website-stress.jsonl";
const lockPath = process.env.AWTSMOOS_STRESS_LOCK
	?? "/tmp/awtsmoos-chatgpt-website-stress.lock";

acquireLock(lockPath);
const service = new DirectService({ preferredPort: port, minimumIntervalMs });
const append = value => fs.appendFileSync(eventPath, `${JSON.stringify(value)}\n`);

try {
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	append({
		type: "start",
		startedAt: new Date().toISOString(),
		conversations,
		messages,
		minimumIntervalMs,
		mode: "chatgpt-website"
	});
	const report = await new FallbackStressRunner({
		service,
		counter: new AuthenticatedConversationCounter({ port }),
		conversations,
		messages,
		minimumIntervalMs,
		onEvent: event => append(sanitizeEvent(event))
	}).run();
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	append({
		type: "success",
		finishedAt: new Date().toISOString(),
		succeeded: report.succeeded,
		conversationDelta: report.conversationCount.delta,
		minimumObservedIntervalMs: report.minimumObservedIntervalMs,
		completionSources: report.completionSources,
		outputPath
	});
	console.log(JSON.stringify({
		status: "passed",
		outputPath,
		succeeded: report.succeeded,
		conversationDelta: report.conversationCount.delta,
		completionSources: report.completionSources
	}, null, 2));
} catch (error) {
	append({
		type: "failure",
		failedAt: new Date().toISOString(),
		code: error?.code || "chatgpt_website_stress_failed",
		message: String(error?.message || error).slice(0, 300),
		accepted: error?.accepted === true
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
			throw new Error("A ChatGPT website stress run is already active.");
		}
		throw error;
	}
}

function sanitizeEvent(event) {
	if (event.type !== "progress") return event;
	return {
		type: event.type,
		conversation: event.conversation,
		message: event.message,
		stage: event.stage,
		status: event.status,
		at: event.at
	};
}
