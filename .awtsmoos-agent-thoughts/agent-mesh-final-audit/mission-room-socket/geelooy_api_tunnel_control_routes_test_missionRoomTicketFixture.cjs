// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds isolated Mission Room ticket route contexts and relay testimony.
 * @description
 * The Awtsmoos renews account, canonical route, mission snapshot, and response.
 * Awtsmoos.com captures every relay argument so tests prove a friendly alias never
 * replaces the immutable tunnel ID after authorization has succeeded.
 */
function routeContext(options = {}) {
	const calls = [];
	const response = {
		statusCode: 0,
		setHeader() {}
	};
	const identity = options.accountId
		? {
			info: {
				userId: options.userId || options.accountId,
				accountId: options.accountId,
				sessionId: options.sessionId || "session-ticket-test"
			}
		}
		: null;
	const context = {
		paramKinds: {
			GET: {
				mode: "socket-ticket",
				tunnelName: options.tunnelReference,
				missionId: options.missionId || "mission-one",
				protocolVersion: "1"
			}
		},
		request: {
			headers: { origin: "https://awtsmoos.com" },
			user: identity
		},
		response,
		ws: {
			async sendTunnelRequest(accountId, routeReference, payload) {
				calls.push({ accountId, routeReference, payload });
				return tunnelResult(payload.action, options.missionExists !== false);
			}
		}
	};
	return { calls, context, response };
}

function tunnelResult(action, missionExists) {
	if (action === "missionProjectStatus") {
		return missionExists
			? { ok: true, mission: { missionId: "mission-one" } }
			: { ok: false, error: "mission_not_found" };
	}
	if (action === "missionTimeline") {
		return { ok: true, timeline: [] };
	}
	if (action === "actionHistorySearch") {
		return { ok: true, results: [] };
	}
	return { ok: true };
}

function ticketClaims(binding, accountId = binding.ownerAccountId) {
	return {
		origin: "https://awtsmoos.com",
		accountId,
		sessionId: "session-ticket-test",
		tunnelName: binding.tunnelName,
		missionId: "mission-one",
		protocolVersion: 1
	};
}

module.exports = {
	routeContext,
	ticketClaims,
	tunnelResult
};
