//B"H
// Boruch Hashem
// Blessed is He

const runs = new Map();
const MAX_EVENTS = 200;

/**
 * UI identity and transport identity live in separate chambers. The Awtsmoos lets
 * Awtsmoos.com expose only the local conversation label while `BH_DIRECT_` keys,
 * prompts, graphs, mode payloads, timers, and abort controllers remain private.
 */
function createRun(payload, config) {
	const uiConversationId = String(payload.conversationId || "").trim();
	if (!uiConversationId) {
		throw new TypeError("conversationId_required");
	}
	return {
		id: `BH_RELAY_AUTO_${Date.now()}_${Math.random().toString(36).slice(2)}`,
		uiConversationId,
		transportConversationKey: null,
		enabled: true,
		settings: normalizeSettings(payload.settings),
		graph: objectOrNull(payload.graph),
		chatgptMode: String(payload.chatgptMode || "regular"),
		chatgptModePayload: objectOrEmpty(payload.chatgptModePayload),
		turns: 0,
		pendingTurn: 0,
		status: "armed",
		phase: "armed",
		nextRunAt: 0,
		events: [],
		startedAt: Date.now(),
		updatedAt: Date.now(),
		busy: false,
		config,
		timer: null,
		abortController: null,
		lastReply: "",
		lastError: "",
		safeError: null
	};
}

function normalizeSettings(settings = {}) {
	const delayMinMs = Math.max(0, Number(settings.delayMinMs ?? settings.delayMs ?? 1000));
	const delayMaxMs = Math.max(delayMinMs, Number(settings.delayMaxMs ?? settings.delayMs ?? delayMinMs));
	return {
		maxTurns: Math.max(1, Number(settings.maxTurns || 3)),
		delayMinMs,
		delayMaxMs,
		streamSettleMs: Math.max(0, Number(settings.streamSettleMs || 0)),
		prompt: String(settings.prompt || "continue"),
		promptMode: String(settings.promptMode || "single"),
		promptListText: String(settings.promptListText || ""),
		stopOnError: settings.stopOnError !== false
	};
}

function publicRun(run) {
	return {
		ok: run.status !== "error",
		owner: "node-relay",
		enabled: Boolean(run.enabled),
		conversationId: run.uiConversationId,
		status: run.status,
		phase: run.phase,
		turns: run.turns,
		pendingTurn: run.pendingTurn,
		nextRunAt: run.nextRunAt,
		error: run.safeError?.error || "",
		safeHint: run.safeError?.safeHint || "",
		lastError: run.lastError,
		lastReply: run.lastReply,
		chatgptMode: run.chatgptMode,
		hasModePayload: Object.keys(run.chatgptModePayload).length > 0,
		settings: publicSettings(run.settings),
		eventCursor: run.events.length,
		events: run.events.slice(-30)
	};
}

function record(run, type, detail = {}) {
	const event = { index: run.events.length, at: Date.now(), type, detail };
	run.updatedAt = event.at;
	run.events.push(event);
	if (run.events.length > MAX_EVENTS) {
		run.events.splice(0, run.events.length - MAX_EVENTS);
	}
	return event;
}

function publicSettings(settings) {
	return {
		maxTurns: settings.maxTurns,
		delayMinMs: settings.delayMinMs,
		delayMaxMs: settings.delayMaxMs,
		streamSettleMs: settings.streamSettleMs,
		promptMode: settings.promptMode,
		stopOnError: settings.stopOnError
	};
}

function objectOrEmpty(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function objectOrNull(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

module.exports = { runs, createRun, publicRun, record };
