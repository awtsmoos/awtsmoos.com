//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";

/**
 * Relay I/O and evidence validation live in one small test vessel. The Awtsmoos
 * permits only safe JSON across it; Awtsmoos.com rejects opaque keys, credentials,
 * socket URLs, and upstream identifiers before a live report reaches disk.
 */
export async function relayJson(relayOrigin, pathname, payload) {
	const response = await fetch(`${relayOrigin}${pathname}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	const value = await response.json();
	if (!response.ok) {
		throw new Error(value.safeHint || value.error || `Relay ${response.status}.`);
	}
	return value;
}

export async function waitForHealth(relayOrigin) {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		try {
			const response = await fetch(`${relayOrigin}/direct-health`);
			if (response.ok) return;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	throw new Error("Direct relay health endpoint did not become ready.");
}

export function buildReport({ turns, conversationCount, continuationCount, minimumIntervalMs }) {
	const intervals = turns.map(turn => turn.pacing?.intervalMs).filter(Number.isFinite);
	const totalExactAnswers = turns.filter(turn => turn.exactAnswer).length;
	return {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		configuration: {
			conversationCount,
			continuationsPerConversation: continuationCount,
			totalRequests: conversationCount * (continuationCount + 1),
			minimumIntervalMs
		},
		totalTransportSucceeded: turns.filter(turn => turn.transportSuccess).length,
		totalExactAnswers,
		exactAnswerRate: totalExactAnswers / turns.length,
		minimumObservedIntervalMs: Math.min(...intervals),
		turns
	};
}

export function validateReport(report) {
	const serialized = JSON.stringify(report);
	const expectedCount = report.configuration.totalRequests;
	if (report.totalTransportSucceeded !== expectedCount) {
		throw new Error("Not every production transport turn succeeded.");
	}
	if (report.minimumObservedIntervalMs < report.configuration.minimumIntervalMs) {
		throw new Error("Production pacing fell below its floor.");
	}
	if (/BH_DIRECT_|Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|wss:\/\/ws\.chatgpt\.com|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(serialized)) {
		throw new Error("Production report retained a forbidden key, credential, socket, or identifier pattern.");
	}
}

export function writeReport(outputPath, report) {
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
}
