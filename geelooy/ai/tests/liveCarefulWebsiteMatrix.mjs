//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const minimumIntervalMs = Math.max(
	12000,
	Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 12000)
);
const outputPath = "geelooy/ai/thoughts/live-careful-website-2x2.json";
const eventPath = "/tmp/awtsmoos-careful-website-2x2.jsonl";
const beforeTargets = await pageTargets();
const service = new DirectService({ preferredPort: port, minimumIntervalMs });
const chains = [
	{ conversation: 1, key: null },
	{ conversation: 2, key: null }
];
const records = [];
const startTimes = [];

try {
	for (const turn of [1, 2]) {
		for (const chain of chains) {
			const expected = `BH CAREFUL WEBSITE C${chain.conversation} T${turn}.`;
			startTimes.push(Date.now());
			const result = await service.send({
				prompt: `Reply with exactly: ${expected}`,
				conversationKey: chain.key,
				mode: "chatgpt-website",
				timeoutMs: 240000,
				onProgress: event => append({
					type: "progress",
					conversation: chain.conversation,
					turn,
					stage: event.stage,
					status: event.status,
					at: event.at
				})
			});
			const exact = result.answer.trim() === expected;
			assert(exact, `Conversation ${chain.conversation} turn ${turn} was not exact.`);
			assert(result.composerTouched === true, "Website composer was not used.");
			assert(result.submissionTransport === "chatgpt-website-composer",
				"Unexpected submission transport.");
			assert(result.completionSource === "page-request-get",
				"Completion did not use authenticated GET polling.");
			if (turn === 1) assert(result.created === true, "New chat was not marked created.");
			if (turn === 2) assert(result.created === false, "Continuation was marked new.");
			if (chain.key) assert(result.conversationKey === chain.key, "Continuation key changed.");
			chain.key = result.conversationKey;
			const record = {
				conversation: chain.conversation,
				turn,
				exact,
				created: result.created,
				sameConversation: result.sameConversation,
				composerTouched: result.composerTouched,
				submissionTransport: result.submissionTransport,
				completionSource: result.completionSource,
				hostReuseSource: result.hostReuseSource,
				intervalMs: result.pacing?.intervalMs ?? null,
				requestLatencyMs: result.requestLatencyMs
			};
			records.push(record);
			append({ type: "turn-complete", ...record });
		}
	}
	assert(chains[0].key !== chains[1].key, "Two new chats shared one local key.");
	const intervals = startTimes.slice(1).map((time, index) => time - startTimes[index]);
	assert(intervals.every(value => value >= minimumIntervalMs), "Turn starts were too close.");
	await service.close();
	const afterTargets = await pageTargets();
	const newTargetIds = afterTargets
		.filter(target => !beforeTargets.some(before => before.id === target.id))
		.map(target => target.id);
	assert(newTargetIds.length === 0, "The relay opened an unnecessary new tab.");
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		mode: "chatgpt-website",
		conversationsCreated: 2,
		turnsPerConversation: 2,
		totalTurns: records.length,
		minimumIntervalMs,
		minimumObservedStartGapMs: Math.min(...intervals),
		beforePageCount: beforeTargets.length,
		afterPageCount: afterTargets.length,
		newTargetIds,
		allExact: records.every(record => record.exact),
		allContinued: records.filter(record => record.turn === 2)
			.every(record => record.sameConversation),
		records
	};
	fs.mkdirSync("geelooy/ai/thoughts", { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	console.log(JSON.stringify({ status: "passed", outputPath, ...report }, null, 2));
} finally {
	await service.close().catch(() => undefined);
}

async function pageTargets() {
	const response = await fetch(`http://127.0.0.1:${port}/json/list`);
	const targets = await response.json();
	return targets.filter(target => target.type === "page")
		.map(target => ({ id: target.id, title: target.title, url: target.url }));
}

function append(value) {
	fs.appendFileSync(eventPath, `${JSON.stringify(value)}\n`);
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}
