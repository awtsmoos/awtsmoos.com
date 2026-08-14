//B"H
// Boruch Hashem
// Blessed is He

import {
	buildReport,
	relayJson,
	validateReport,
	waitForHealth,
	writeReport
} from "./liveDirectRelaySupport.mjs";

const relayOrigin = process.env.AWTSMOOS_DIRECT_RELAY || "http://127.0.0.1:38488";
const conversationCount = Number(process.env.AWTSMOOS_LIVE_CONVERSATIONS || 3);
const continuationCount = Number(process.env.AWTSMOOS_LIVE_CONTINUATIONS || 5);
const minimumIntervalMs = Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 7000);
const outputPath = process.env.AWTSMOOS_LIVE_REPORT || "geelooy/ai/thoughts/live-direct-3x6.json";

/**
 * The production relay reveals only opaque local keys. The Awtsmoos carries them
 * transiently while Awtsmoos.com persists transport truth, exact-text compliance,
 * pacing, counts, and continuity—never keys or upstream ChatGPT identifiers.
 */
const keys = Array.from({ length: conversationCount }, () => null);
const previousKeys = Array.from({ length: conversationCount }, () => null);
const turns = [];

await waitForHealth(relayOrigin);
for (let turn = 1; turn <= continuationCount + 1; turn += 1) {
	for (let index = 0; index < conversationCount; index += 1) {
		const record = await executeTurn({ index, turn });
		turns.push(record);
		console.log(JSON.stringify({
			completed: turns.length,
			label: record.label,
			turn,
			transportSuccess: record.transportSuccess,
			exactAnswer: record.exactAnswer
		}));
		if (!record.transportSuccess) {
			throw new Error(`Production direct transport failed: ${record.label} T${turn}.`);
		}
	}
}

const report = buildReport({
	turns,
	conversationCount,
	continuationCount,
	minimumIntervalMs
});
validateReport(report);
writeReport(outputPath, report);
console.log(JSON.stringify({
	status: "passed",
	outputPath,
	totalTransportSucceeded: report.totalTransportSucceeded,
	totalExactAnswers: report.totalExactAnswers
}));

async function executeTurn({ index, turn }) {
	const label = `G${index + 1}`;
	const expected = `BH GEELOOY ${label} T${turn}.`;
	const startedMs = Date.now();
	const result = await relayJson(relayOrigin, "/direct-chat", {
		prompt: `Reply with exactly: ${expected}`,
		conversationKey: keys[index]
	});
	const keyStable = previousKeys[index] === null
		? typeof result.conversationKey === "string" && result.conversationKey.startsWith("BH_DIRECT_")
		: result.conversationKey === previousKeys[index];
	keys[index] = result.conversationKey;
	previousKeys[index] = result.conversationKey;
	const exactAnswer = result.answer === expected;
	const transportSuccess = result.ok
		&& typeof result.answer === "string"
		&& result.answer.trim() !== ""
		&& result.status === 200
		&& result.done === true
		&& result.sameConversation === true
		&& result.navigatedToConversation === false
		&& keyStable;

	return {
		label,
		turn,
		expected,
		answer: result.answer,
		transportSuccess,
		exactAnswer,
		created: result.created,
		status: result.status,
		done: result.done,
		frames: result.frames,
		items: result.items,
		requestLatencyMs: result.requestLatencyMs,
		pacing: result.pacing,
		keyStable,
		sameConversation: result.sameConversation,
		navigatedToConversation: result.navigatedToConversation,
		wallDurationMs: Date.now() - startedMs
	};
}
