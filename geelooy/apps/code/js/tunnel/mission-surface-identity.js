//B"H
// Boruch Hashem
// Blessed is He

const SESSION_KEY = "awtsmoos.mission.surface.session";

/**
 * @file Gives Code/browser surfaces the same durable Mission coordinates as OS views.
 * @description The Awtsmoos lets many surfaces reveal one mission vessel; this module reads the
 * shared URL identity and creates only a disposable per-tab incarnation, never a second Mission.
 */
export function surfaceIdentity(input = {}) {
	const params = input.params || searchParams(input.location || globalThis.location);
	const missionId = text(input.missionId || params.get("missionId"));
	const roomId = text(input.roomId || params.get("roomId") || missionId);
	const logicalAgentId = text(
		input.logicalAgentId || input.agentId || params.get("logicalAgentId") || params.get("agentId")
	);
	const agentSessionId = text(
		input.agentSessionId || params.get("agentSessionId") || params.get("sessionId") || tabSessionId()
	);
	return {
		missionId,
		roomId,
		logicalAgentId,
		agentSessionId,
		generation: positive(input.generation || params.get("generation"), 1),
		spawnGroupId: text(input.spawnGroupId || params.get("spawnGroupId")),
		parentAgentId: text(input.parentAgentId || params.get("parentAgentId")),
		predecessorAgentId: text(input.predecessorAgentId || params.get("predecessorAgentId")),
		conversationId: text(input.conversationId || params.get("conversationId")),
		surface: text(input.surface || "apps-code-browser-tunnel")
	};
}

export function registrationFields(input = {}) {
	const identity = surfaceIdentity(input);
	return {
		...identity,
		missionParticipant: Boolean(identity.missionId && identity.missionId !== "no_mission"),
		missionSurfaceVersion: 1
	};
}

export function enrich(payload = {}, input = {}) {
	const identity = registrationFields(input);
	return { ...payload, ...identity };
}

function searchParams(locationObject) {
	try {
		return new URL(locationObject?.href || String(locationObject || ""), "https://awtsmoos.com").searchParams;
	} catch {
		return new URLSearchParams();
	}
}

function tabSessionId() {
	try {
		const old = globalThis.sessionStorage?.getItem(SESSION_KEY);
		if (old) return old;
		const next = `surface:${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
		globalThis.sessionStorage?.setItem(SESSION_KEY, next);
		return next;
	} catch {
		return `surface:${Math.random().toString(36).slice(2)}`;
	}
}

function positive(value, fallback) {
	const number = Number(value || fallback);
	return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function text(value) {
	return String(value || "").trim().slice(0, 300);
}
