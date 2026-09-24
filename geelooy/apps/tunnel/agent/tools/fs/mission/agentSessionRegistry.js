//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AgentSessionRegistry
 * @description Governs disposable agent sessions beneath durable mission and room identity.
 * The Awtsmoos lets a conversation end while its Shliach remains named; Awtsmoos.com
 * preserves logical agent, room, and mission truth across reconnect and replacement.
 */
const crypto = require("node:crypto");
const Store = require("./agentSessionStore.js");
const Claims = require("./assignment/claims.js");

function sessionId(input = {}) {
	return Store.clean(
		input.agentSessionId || input.sessionId || input.chatSessionId ||
		`session_${Date.now().toString(36)}_${crypto.randomBytes(5).toString("hex")}`
	);
}

/** Opens or refreshes one physical/logical chat vessel and closes its replacement loop. */
async function open(config, input = {}) {
	const id = sessionId(input);
	const previous = await Store.load(config, id);
	const now = new Date().toISOString();
	const session = {
		...previous,
		id,
		logicalAgentId: input.logicalAgentId || input.agentId || previous?.logicalAgentId || "agent",
		chatId: input.chatId || input.conversationId || previous?.chatId || "",
		role: input.role || previous?.role || "worker",
		roomId: input.roomId || previous?.roomId || "",
		status: "active",
		startedAt: previous?.startedAt || now,
		lastSeenAt: now,
		activeMissionId: input.missionId || previous?.activeMissionId || "",
		assignmentHistory: previous?.assignmentHistory || [],
		replacementOf: input.replacementOf || previous?.replacementOf || ""
	};
	await Store.save(config, session);
	if (session.replacementOf && session.replacementOf !== session.id) {
		await recoverPrior(config, session.replacementOf, session.id, now);
	}
	return session;
}

/** Records one mission borrowing event without transferring room ownership to the chat. */
async function assign(config, session, assignment = {}) {
	const now = new Date().toISOString();
	const record = {
		at: now,
		missionId: assignment.missionId || "",
		roomId: assignment.roomId || session.roomId || "",
		workId: assignment.workId || "",
		reason: assignment.reason || "dispatcher",
		projectRoot: assignment.projectRoot || ""
	};
	session.activeMissionId = record.missionId;
	session.roomId = record.roomId;
	session.lastAssignment = record;
	session.assignmentHistory = [...(session.assignmentHistory || []), record].slice(-100);
	session.status = "working";
	session.lastSeenAt = now;
	return Store.save(config, session);
}

/** Refreshes liveness without mutating durable mission or room state. */
async function heartbeat(config, input = {}) {
	const id = sessionId(input);
	const session = await Store.load(config, id);
	if (!session) return null;
	session.lastSeenAt = new Date().toISOString();
	session.status = input.status || session.status || "active";
	if (input.roomId) session.roomId = input.roomId;
	return Store.save(config, session);
}

/** Ends one chat; recoverable exhaustion preserves its durable work claim. */
async function close(config, input = {}, status = "ended") {
	const id = sessionId(input);
	const session = await Store.load(config, id);
	if (!session) return null;
	session.status = status;
	session.endedAt = new Date().toISOString();
	session.lastSeenAt = session.endedAt;
	session.replacementNeeded = status === "exhausted" || status === "stale";
	if (!session.replacementNeeded) await Claims.releaseSession(config, session);
	return Store.save(config, session);
}

async function recoverPrior(config, priorId, replacementId, now) {
	const prior = await Store.load(config, priorId);
	if (!prior) return null;
	prior.replacementNeeded = false;
	prior.replacedBy = replacementId;
	prior.recoveredAt = now;
	prior.replacementRequestedAt = "";
	return Store.save(config, prior);
}

module.exports = {
	assign,
	close,
	heartbeat,
	open,
	sessionId
};
