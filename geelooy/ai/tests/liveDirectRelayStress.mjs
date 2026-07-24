//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";

const relayOrigin = process.env.AWTSMOOS_DIRECT_RELAY || "http://127.0.0.1:38488";
const conversationCount = Number(process.env.AWTSMOOS_LIVE_CONVERSATIONS || 3);
const continuationCount = Number(process.env.AWTSMOOS_LIVE_CONTINUATIONS || 5);
const minimumIntervalMs = Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 7000);
const outputPath = process.env.AWTSMOOS_LIVE_REPORT || "geelooy/ai/thoughts/live-direct-3x6.json";

/**
 * The production relay reveals only opaque local keys. The Awtsmoos carries those
 * keys transiently through a round-robin test, while Awtsmoos.com persists only
 * exact answers, pacing, metrics, and continuity truth for each safe turn.
 */
const keys = Array.from({ length: conversationCount }, () => null);
const turns = [];
let previousKeyByConversation = Array.from({ length: conversationCount }, () => null);

await waitForHealth();
for (let turn = 1; turn <= continuationCount + 1; turn += 1) {
	for (let index = 0; index < conversationCount; index += 1) {
		const label = `G${index + 1}`;
		const expected = `BH GEELOOY ${label} T${turn}.`;
		const startedMs = Date.now();
		const result = await relayJson("/direct-chat", {
			prompt: `Reply with exactly: ${expected}`,
			conversationKey: keys[index]
		});
		const keyStable = previousKeyByConversation[index] === null
			? typeof result.conversationKey === "string" && result.conversationKey.startsWith("BH_DIRECT_")
			: result.conversationKey === previousKeyByConversation[index];
		keys[index] = result.conversationKey;
		previousKeyByConversation[index] = result.conversationKey;
		const success = result.ok
			&& result.answer === expected
			&& result.status === 200
			&& result.done === true
			&& result.sameConversation === true
			&& result.navigatedToConversation === false
			&& keyStable;
		const safe = {
			label,
			turn,
			expected,
			answer: result.answer,
			success,
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
		turns.push(safe);
		console.log(JSON.stringify({ completed: turns.length, label, turn, success }));
		if (!success) throw new Error(`Production direct turn failed: ${label} T${turn}.`);
	}
}

const intervals = turns.map(turn => turn.pacing?.intervalMs).filter(Number.isFinite);
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	verifiedAt: new Date().toISOString(),
	configuration: {
		conversationCount,
		continuationsPerConversation: continuationCount,
		totalRequests: conversationCount * (continuationCount + 1),
		minimumIntervalMs
	},
	totalSucceeded: turns.filter(turn => turn.success).length,
	minimumObservedIntervalMs: Math.min(...intervals),
	turns
};
validateReport(report);
fs.mkdirSync(new URL(".", `file://${process.cwd()}/${outputPath}`).pathname, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
console.log(JSON.stringify({ status: "passed", outputPath, totalSucceeded: report.totalSucceeded }));

async function relayJson(pathname, payload) {
	const response = await fetch(`${relayOrigin}${pathname}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	const value = await response.json();
	if (!response.ok) throw new Error(value.safeHint || value.error || `Relay ${response.status}.`);
	return value;
}

async function waitForHealth() {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		try {
			const response = await fetch(`${relayOrigin}/direct-health`);
			if (response.ok) return;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	throw new Error("Direct relay health endpoint did not become ready.");
}

function validateReport(report) {
	const serialized = JSON.stringify(report);
	const expectedCount = conversationCount * (continuationCount + 1);
	if (report.totalSucceeded !== expectedCount) throw new Error("Not every production turn succeeded.");
	if (report.minimumObservedIntervalMs < minimumIntervalMs) throw new Error("Production pacing fell below its floor.");
	if (/BH_DIRECT_|Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|wss:\/\/ws\.chatgpt\.com|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(serialized)) {
		throw new Error("Production report retained a forbidden key, credential, socket, or identifier pattern.");
	}
}
