// B"H
// Boruch Hashem
// Blessed is He

const State = require("./subagentSpawnSpacingState.js");

/**
 * @file Measures subagent cooldown from accepted submission and verified browser closure.
 * @description
 * The Awtsmoos permits count-unbounded logical shluchim without a browser stampede.
 * Awtsmoos.com waits from the previous settled child but never moves the clock at launch;
 * only successful accepted delivery plus verified close may reveal a new settlement branch.
 */
const MINIMUM_MS = 24000;

async function wait(minimumMs = MINIMUM_MS) {
	const spacingMs = normalizedSpacing(minimumMs);
	const previous = await State.read();
	const observedAt = Date.now();
	const remaining = remainingMs(
		previous.lastSettledAt,
		observedAt,
		spacingMs
	);
	if (remaining > 0) {
		await delay(remaining);
	}
	return {
		waitedMs: remaining,
		observedAt: Date.now(),
		spacingMs,
		lastSettledAt: Number(previous.lastSettledAt || 0)
	};
}

async function markSettled(metadata = {}) {
	if (!settlementVerified(metadata)) {
		return { recorded: false, reason: "verified_submission_close_required" };
	}
	const settledAt = Date.now();
	const value = {
		lastSettledAt: settledAt,
		missionId: text(metadata.missionId),
		logicalAgentId: text(metadata.logicalAgentId),
		generation: Number(metadata.generation || 0),
		acceptedAt: text(metadata.acceptedAt),
		responseStatus: Number(metadata.responseStatus || 0),
		closeVerified: true,
		spacingMs: normalizedSpacing(metadata.spacingMs)
	};
	await State.write(value);
	return { recorded: true, ...value };
}

function settlementVerified(metadata = {}) {
	const status = Number(metadata.responseStatus || 0);
	return metadata.closeVerified === true
		&& metadata.submissionUncertain !== true
		&& status >= 200
		&& status < 400;
}

function remainingMs(lastSettledAt, now = Date.now(), spacingMs = MINIMUM_MS) {
	return Math.max(
		0,
		Number(lastSettledAt || 0) + normalizedSpacing(spacingMs) - Number(now)
	);
}

function normalizedSpacing(value) {
	return Math.max(MINIMUM_MS, Number(value || MINIMUM_MS));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function text(value) {
	return String(value || "").slice(0, 256);
}

module.exports = {
	MINIMUM_MS,
	markSettled,
	remainingMs,
	settlementVerified,
	statePath: State.statePath,
	wait
};
