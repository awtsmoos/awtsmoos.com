//B"H // Boruch Hashem // Blessed is He

const Mission = require("./index.js");
const Auto = require("./autoContinuation/index.js");

/**
 * @module AgentSessionContinuation
 * @description The Awtsmoos lets a disposable Shliach finish without pretending durable Work
 * finished with it; Awtsmoos.com records the messenger's end once, then asks the existing
 * debt-aware, lease-fenced continuation engine whether another visible Shliach must arise.
 */

/**
 * Record one terminal Shliach session and pulse Mission continuation idempotently.
 * @param {object} config Tunnel Mission storage configuration.
 * @param {object|null} session Persisted disposable agent-session record.
 * @param {object} [options] Optional test/runtime dependencies.
 * @returns {Promise<object>} Bridge receipt plus continuation result.
 */
async function afterClose(config, session, options = {}) {
	const missionId = clean(session?.activeMissionId);
	if (!missionId) {
		return receipt("no_active_mission", session);
	}
	const mission = options.mission || await Mission.load(config, missionId);
	if (!mission?.id) {
		return receipt("mission_not_found", session, { missionId });
	}
	const recorded = recordTerminalEvent(mission, session);
	if (recorded) {
		await Mission.save(config, mission);
	}
	const runContinuation = options.runContinuation || Auto.run;
	const continuation = await runContinuation(config, {
		mission,
		now: options.now,
		owner: options.owner || `agent-session-end:${session.id}`,
		transport: options.transport || "shared_shliach",
		env: options.env
	});
	return receipt("continuation_pulsed", session, {
		missionId: mission.id,
		recorded,
		continuation
	});
}

/**
 * Append one session-specific terminal event without marking any Work or claim done.
 * @param {object} mission Durable Mission record.
 * @param {object} session Terminal disposable session.
 * @returns {boolean} True only when a new terminal event was appended.
 */
function recordTerminalEvent(mission, session) {
	const prior = (mission.events || []).some(event =>
		event.type === "mission_agent_complete" &&
		event.data?.agentSessionId === session.id
	);
	if (prior) {
		return false;
	}
	Mission.event(
		mission,
		"mission_agent_complete",
		`${session.logicalAgentId || "agent"} Shliach session ended; durable Mission debt remains authoritative`,
		{
			agentId: session.logicalAgentId || "agent",
			agentSessionId: session.id,
			chatId: session.chatId || "",
			sessionStatus: session.status || "ended",
			sessionEnded: true
		}
	);
	return true;
}

/** Build one compact, non-secret bridge receipt. */
function receipt(reason, session, extra = {}) {
	return {
		ok: true,
		reason,
		agentSessionId: session?.id || "",
		logicalAgentId: session?.logicalAgentId || "",
		...extra
	};
}

/** Normalize portable identity fields without inventing authority. */
function clean(value) {
	return String(value || "").trim();
}

module.exports = { afterClose, recordTerminalEvent };
