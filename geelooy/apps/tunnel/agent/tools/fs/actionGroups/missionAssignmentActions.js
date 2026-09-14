//B"H
//Boruch Hashem
//Blessed be He

const Instructions = require("../../../lib/instructions/hybridService.js").hybridInstructionService;
const Recovery = require("../mission/agentSessionRecovery.js");
const Sessions = require("../mission/agentSessionRegistry.js");
const Dispatcher = require("../mission/assignment/dispatcher.js");
const Reconcile = require("../mission/assignment/reconcile.js");
const Report = require("../mission/assignment/report.js");
const Status = require("../mission/assignment/status.js");
const Payload = require("./missionActionPayload.js");

/**
 * @file Gives every disposable Shliach one tiny Tunnel-owned doorway into durable work.
 * @description
 * A new chat connects, receives the best mission briefing, fetches deeper instruction bodies
 * only when needed, reports findings, and can disappear without taking the mission with it.
 */
function buildMissionAssignmentActions(context) {
	const { config } = context;
	const payload = Payload.mergedPayload(context.payload || {});
	return {
		async missionAgentConnect() {
			const session = await Sessions.open(config, payload);
			if (payload.assign === false || payload.assign === "false") {
				return { ok: true, action: "missionAgentConnect", session: publicSession(session) };
			}
			return assignmentResponse(config, session, payload, "missionAgentConnect");
		},
		async missionAgentNextWork() {
			const session = await Sessions.open(config, payload);
			return assignmentResponse(config, session, payload, "missionAgentNextWork");
		},
		async missionAgentHeartbeat() {
			const session = await Sessions.heartbeat(config, payload);
			return { ok: Boolean(session), action: "missionAgentHeartbeat", session: publicSession(session) };
		},
		async missionAgentReport() {
			return { action: "missionAgentReport", ...(await Report.record(config, payload)) };
		},
		async missionAgentSessionEnd() {
			const session = await Sessions.close(config, payload, "ended");
			return { ok: Boolean(session), action: "missionAgentSessionEnd", session: publicSession(session) };
		},
		async missionAgentSessionExhausted() {
			const session = await Sessions.close(config, payload, "exhausted");
			return { ok: Boolean(session), action: "missionAgentSessionExhausted", session: publicSession(session) };
		},
		async missionDispatchStatus() {
			return Status.snapshot(config, payload);
		},
		async missionDispatchReconcile() {
			return Reconcile.all(config, payload);
		},
		async missionAgentRecoveryCandidates() {
			const candidates = await Recovery.candidates(config, payload);
			return { ok: true, action: "missionAgentRecoveryCandidates", candidates: candidates.map(publicSession) };
		}
	};
}

async function assignmentResponse(config, session, payload, action) {
	const assignment = await Dispatcher.next(config, session, payload);
	const instructionResolution = await Instructions.resolve(
		assignment.briefing?.instructionRequest || {}
	);
	return {
		...assignment,
		action,
		session: publicSession(session),
		instructionResolution,
		instructionPolicy: "Fetch full bodies by ID only when needed; local safety doctrine remains available offline."
	};
}

function publicSession(session) {
	if (!session) return null;
	return {
		id: session.id,
		logicalAgentId: session.logicalAgentId,
		role: session.role,
		status: session.status,
		activeMissionId: session.activeMissionId,
		lastSeenAt: session.lastSeenAt,
		replacementNeeded: Boolean(session.replacementNeeded)
	};
}

module.exports = { assignmentResponse, buildMissionAssignmentActions, publicSession };
