//B"H
// Boruch Hashem
// Blessed is He

const SESSION_KEY = "awtsmoos.tunnel.mission.surface.session";

/**
 * @file Gives the regular browser Tunnel the same Mission coordinates used by OS and Code.
 * @description The Awtsmoos reveals one Mission through many surfaces; this browser owns only a
 * disposable incarnation while Mission, Room, Work, obligations and context remain server truth.
 */
export function browserMissionSurface(input = {}) {
	const params = input.params || parameters(input.location || globalThis.location);
	const missionId = text(input.missionId || params.get("missionId"));
	return {
		missionId,
		roomId: text(input.roomId || params.get("roomId") || missionId),
		logicalAgentId: text(input.logicalAgentId || input.agentId || params.get("logicalAgentId") || params.get("agentId")),
		agentSessionId: text(input.agentSessionId || params.get("agentSessionId") || params.get("sessionId") || tabSessionId()),
		generation: positive(input.generation || params.get("generation"), 1),
		spawnGroupId: text(input.spawnGroupId || params.get("spawnGroupId")),
		parentAgentId: text(input.parentAgentId || params.get("parentAgentId")),
		predecessorAgentId: text(input.predecessorAgentId || params.get("predecessorAgentId")),
		conversationId: text(input.conversationId || params.get("conversationId")),
		surface: text(input.surface || "browser-tunnel"),
		missionParticipant: Boolean(missionId && missionId !== "no_mission"),
		missionSurfaceVersion: 1
	};
}

function parameters(locationObject) {
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
