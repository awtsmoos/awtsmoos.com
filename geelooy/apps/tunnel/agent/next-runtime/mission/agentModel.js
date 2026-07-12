// B"H
const CONTROL_STATES = new Set(["running", "paused", "draining", "stopped"]);

function create(input = {}) {
	const now = new Date().toISOString();
	return {
		agentId: required(input.agentId, "missing_agent_id"),
		logicalAgentId: required(input.logicalAgentId || input.agentId, "missing_logical_agent_id"),
		agentSessionId: required(input.agentSessionId, "missing_agent_session_id"),
		missionId: required(input.missionId, "missing_mission_id"),
		roomId: required(input.roomId, "missing_room_id"),
		desiredState: "running",
		observedState: "idle",
		revision: 0,
		oneTurnCredits: 0,
		inbox: [],
		assignedTasks: [],
		currentTask: null,
		currentAction: null,
		continuationPolicy: input.continuationPolicy || {},
		lease: input.lease || null,
		claims: [],
		resources: [],
		lastCheckpoint: null,
		startedTurns: 0,
		completedTurns: 0,
		createdAt: now,
		updatedAt: now
	};
}

function revise(runtime, patch) {
	return { ...runtime, ...patch, revision: runtime.revision + 1, updatedAt: new Date().toISOString() };
}

function assertRevision(runtime, expectedRevision) {
	if (expectedRevision !== undefined && runtime.revision !== expectedRevision) {
		throw failure("agent_revision_conflict", { currentRevision: runtime.revision });
	}
}

function stateForCommand(command, fallback) {
	const state = { pause: "paused", resume: "running", drain: "draining", stop: "stopped" }[command] || fallback;
	if (!CONTROL_STATES.has(state)) throw failure("invalid_agent_control");
	return state;
}

function required(value, code) {
	if (!String(value || "").trim()) throw failure(code);
	return String(value);
}

function failure(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { assertRevision, create, failure, required, revise, stateForCommand };
