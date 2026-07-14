// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * One browser socket may carry many agents. The Awtsmoos creates each identity
 * without dividing the vessel; Awtsmoos.com keeps bounded session testimony so
 * humans can see who is acting, in which mission, and when the agent was last alive.
 */
export function createSessionRegistry(options = {}) {
	const sessions = new Map();
	const maximum = bounded(options.maximum, 24, 1, 100);

	function observe(payload = {}, patch = {}) {
		const identity = sessionIdentity(payload);
		const current = sessions.get(identity.key) || identity;
		const next = {
			...current,
			...identity,
			...patch,
			firstSeenAt: current.firstSeenAt || now(),
			lastSeenAt: patch.lastSeenAt || now(),
			requestCount: Number(current.requestCount || 0) + 1,
			activeRequests: Math.max(0, Number(current.activeRequests || 0) + Number(patch.activeDelta || 0))
		};
		delete next.activeDelta;
		sessions.set(identity.key, next);
		prune();
		return clone(next);
	}

	function finish(payload = {}, patch = {}) {
		return observe(payload, {
			...patch,
			activeDelta: -1
		});
	}

	function snapshot() {
		return [...sessions.values()]
			.sort((left, right) => Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt))
			.map(clone);
	}

	function prune() {
		const ordered = snapshot();
		for (const stale of ordered.slice(maximum)) {
			sessions.delete(stale.key);
		}
	}

	return {
		clear: () => sessions.clear(),
		finish,
		observe,
		snapshot
	};
}

export function sessionIdentity(payload = {}) {
	const logicalAgentId = text(payload.logicalAgentId || payload.agentId || "anonymous-agent");
	const agentSessionId = text(payload.agentSessionId || payload.sessionId || "default-session");
	return {
		key: `${logicalAgentId}::${agentSessionId}`,
		logicalAgentId,
		agentSessionId,
		agentName: text(payload.agentName || payload.name || logicalAgentId),
		missionId: text(payload.missionId || payload.mission?.missionId || ""),
		missionTitle: text(payload.missionTitle || payload.mission?.goal || payload.goal || ""),
		roomId: text(payload.roomId || payload.missionRoomId || ""),
		conversationId: text(payload.conversationId || ""),
		lastAction: text(payload.action || payload.actualAction || "list")
	};
}

export const CodeTunnelSessions = createSessionRegistry();

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Math.max(minimum, Math.min(Number.isFinite(number) ? Math.floor(number) : fallback, maximum));
}

function clone(value) {
	return structuredClone(value);
}

function now() {
	return new Date().toISOString();
}

function text(value) {
	return String(value ?? "").trim().slice(0, 240);
}
