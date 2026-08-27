// B"H
// Boruch Hashem
// Blessed is He

import { sessionIdentity } from "./session-registry.js";

/**
 * B"H
 *
 * Every tunnel request leaves a bounded, correlation-safe footprint. The Awtsmoos
 * renews action and witness; Awtsmoos.com shows enough truth for humans to follow
 * live agents without storing secrets, command bodies, or unbounded response data.
 */
export function createActionLedger(options = {}) {
	const entries = [];
	const maximum = bounded(options.maximum, 180, 1, 1000);
	let nextSequence = 1;

	function begin(payload = {}) {
		const identity = sessionIdentity(payload);
		const entry = sanitize({
			sequence: nextSequence++,
			state: "running",
			startedAt: now(),
			...identity,
			requestId: payload.requestId || payload.controlRequestId || payload.id || "",
			action: payload.action || payload.actualAction || "list",
			tabId: payload.tabId || payload.previewTabId || payload.targetId || "",
			path: payload.path || payload.p || payload.url || ""
		});
		entries.unshift(entry);
		entries.splice(maximum);
		return entry.sequence;
	}

	function finish(sequence, result = {}) {
		const entry = entries.find(item => item.sequence === Number(sequence));
		if (!entry) {
			return null;
		}
		entry.state = result.ok === false ? "failed" : "completed";
		entry.finishedAt = now();
		entry.durationMs = Math.max(0, Date.parse(entry.finishedAt) - Date.parse(entry.startedAt));
		entry.error = safeText(result.error || result.message || "", 240);
		entry.status = Number(result.status || 0) || null;
		return structuredClone(entry);
	}

	function snapshot(filter = {}) {
		return entries
			.filter(entry => matches(entry, filter))
			.map(entry => structuredClone(entry));
	}

	return {
		begin,
		clear: () => entries.splice(0),
		finish,
		snapshot
	};
}

export const CodeTunnelActions = createActionLedger();

function matches(entry, filter) {
	return (!filter.logicalAgentId || entry.logicalAgentId === filter.logicalAgentId) &&
		(!filter.agentSessionId || entry.agentSessionId === filter.agentSessionId) &&
		(!filter.missionId || entry.missionId === filter.missionId);
}

function sanitize(value) {
	return Object.fromEntries(Object.entries(value).map(([key, item]) => [
		key,
		typeof item === "string" ? safeText(item) : item
	]));
}

function safeText(value, maximum = 320) {
	return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, maximum);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Math.max(minimum, Math.min(Number.isFinite(number) ? Math.floor(number) : fallback, maximum));
}

function now() {
	return new Date().toISOString();
}
