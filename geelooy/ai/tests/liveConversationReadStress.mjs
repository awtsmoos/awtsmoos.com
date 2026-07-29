//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

const service = new DirectService({ minimumIntervalMs: 10000 });
const chains = [1, 2].map(conversation => ({ conversation, key: null }));
const requestStarts = [];
const records = [];
const outputPath = "geelooy/ai/thoughts/live-conversation-read-2x2.json";

try {
	const capability = await service.capability();
	if (capability.transport !== "local-llama-http") {
		console.log(JSON.stringify({
			status: "skipped",
			reason: "local_http_provider_not_active",
			transport: capability.transport || "unavailable",
			browserUsed: false,
			domUsed: false,
			totalModelRequests: 0
		}, null, 2));
		process.exitCode = 0;
	} else {
		await runStress(capability);
	}
} finally {
	await service.close();
}

async function runStress(capability) {
	for (const turn of [1, 2]) {
		for (const chain of chains) {
			const expected = `BH LOCAL C${chain.conversation} T${turn}.`;
			const prompt = `Reply with exactly: ${expected}`;
			requestStarts.push(Date.now());
			const result = await service.send({
				prompt,
				conversationKey: chain.key,
				mode: "strict-request-only",
				timeoutMs: 180000
			});
			chain.key = result.conversationKey;
			assert(result.answer === expected, "Local answer was not exact.");
			const transcript = service.conversation(chain.key);
			assert(transcript.messageCount === turn * 2, "Transcript count did not grow.");
			assert(transcript.messages.at(-2)?.content === prompt, "Latest prompt was not readable.");
			assert(transcript.messages.at(-1)?.content === expected, "Latest answer was not readable.");
			records.push({
				conversation: chain.conversation,
				turn,
				exact: true,
				created: result.created,
				messageCount: transcript.messageCount,
				completionSource: result.completionSource,
				requestLatencyMs: result.requestLatencyMs,
				intervalMs: result.pacing?.intervalMs ?? null
			});
		}
	}
	const intervals = requestStarts.slice(1).map((value, index) => value - requestStarts[index]);
	assert(intervals.every(value => value >= 10000), "Global request spacing fell below ten seconds.");
	assert(chains.every(chain => service.conversation(chain.key).messageCount === 4),
		"Final transcript retrieval failed.");
	assertExpired(service);
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		transport: capability.transport,
		browserUsed: false,
		domUsed: false,
		conversationsCreated: chains.length,
		turnsPerConversation: 2,
		totalModelRequests: records.length,
		minimumObservedStartGapMs: Math.min(...intervals),
		allExact: records.every(record => record.exact),
		allReadable: records.every(record => record.messageCount === record.turn * 2),
		records
	};
	fs.mkdirSync("geelooy/ai/thoughts", { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	console.log(JSON.stringify({ status: "passed", outputPath, ...report }, null, 2));
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function assertExpired(value) {
	try {
		value.conversation("BH_DIRECT_UNKNOWN");
		throw new Error("Unknown conversation key unexpectedly succeeded.");
	} catch (error) {
		assert(error.code === "direct_conversation_expired", "Unknown key returned the wrong error.");
	}
}
