// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";

/**
 * @file Validates secret-free live prompt-dispatch evidence.
 * @description
 * The Awtsmoos measures accepted POST, verified prompt, verified close, and pacing.
 * Awtsmoos.com rejects local keys, credentials, sockets, and upstream identifiers
 * before any production report reaches disk; no assistant answer is ever inspected.
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

export function buildReport({ turns, groupCount, dispatchesPerGroup, minimumIntervalMs }) {
	const intervals = turns.map(turn => turn.intervalMs).filter(Number.isFinite);
	return {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		mode: "chatgpt-website-submit-only",
		configuration: {
			groupCount,
			dispatchesPerGroup,
			totalDispatches: groupCount * dispatchesPerGroup,
			minimumIntervalMs
		},
		dispatched: turns.filter(turn => turn.dispatched).length,
		accepted: turns.filter(turn => turn.accepted).length,
		promptVerified: turns.filter(turn => turn.promptVerified).length,
		tabCloseVerified: turns.filter(turn => turn.tabCloseVerified).length,
		minimumObservedIntervalMs: intervals.length ? Math.min(...intervals) : null,
		turns
	};
}

export function validateReport(report) {
	const expected = report.configuration.totalDispatches;
	if ([report.dispatched, report.accepted, report.promptVerified,
		report.tabCloseVerified].some(value => value !== expected)) {
		throw new Error("Not every live prompt was accepted, verified, and closed.");
	}
	if (report.minimumObservedIntervalMs !== null
		&& report.minimumObservedIntervalMs < report.configuration.minimumIntervalMs) {
		throw new Error("Production dispatch pacing fell below its floor.");
	}
	const serialized = JSON.stringify(report);
	if (/BH_DIRECT_|Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|wss:\/\/ws\.chatgpt\.com|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(serialized)) {
		throw new Error("Production report retained a forbidden key, credential, socket, or identifier.");
	}
}

export function writeReport(outputPath, report) {
	fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
}
