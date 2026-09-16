//B"H // Boruch Hashem // Blessed is He

const Instructions = require("../../../lib/instructions/hybridService.js").hybridInstructionService;
const Recovery = require("../mission/agentSessionRecovery.js");
const Sessions = require("../mission/agentSessionRegistry.js");
const SessionContinuation = require("../mission/agentSessionContinuation.js");
const Dispatcher = require("../mission/assignment/dispatcher.js");
const Reconcile = require("../mission/assignment/reconcile.js");
const Report = require("../mission/assignment/report.js");
const Status = require("../mission/assignment/status.js");
const Payload = require("./missionActionPayload.js");

/**
 * @file Gives every disposable Shliach one bounded doorway into durable Mission work.
 * @description The Awtsmoos lets a chat borrow Work and then vanish while Awtsmoos.com preserves
 * Mission truth; terminal sessions now pulse the existing lease-fenced continuation engine so
 * unfinished debt can open exactly one successor Shliach without declaring the borrowed Work done.
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
			return endSession(config, payload, "ended", "missionAgentSessionEnd");
		},
		async missionAgentSessionExhausted() {
			return endSession(config, payload, "exhausted", "missionAgentSessionExhausted");
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

/** Close one disposable messenger and pulse continuation without completing its durable Work. */
async function endSession(config, payload, status, action) {
	const session = await Sessions.close(config, payload, status);
	const continuation = session
		? await SessionContinuation.afterClose(config, session, {
			transport: payload.transport || "shared_shliach"
		})
		: null;
	return {
		ok: Boolean(session),
		action,
		session: publicSession(session),
		continuation
	};
}

/** Assign one available durable Work node and resolve only the requested instruction bodies. */
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

/** Expose non-secret session lineage and lifecycle testimony. */
function publicSession(session) {
	if (!session) return null;
	return {
		id: session.id,
		logicalAgentId: session.logicalAgentId,
		chatId: session.chatId || "",
		role: session.role,
		status: session.status,
		activeMissionId: session.activeMissionId,
		lastSeenAt: session.lastSeenAt,
		endedAt: session.endedAt || "",
		replacementNeeded: Boolean(session.replacementNeeded),
		replacedBy: session.replacedBy || ""
	};
}

module.exports = { assignmentResponse, buildMissionAssignmentActions, endSession, publicSession };
