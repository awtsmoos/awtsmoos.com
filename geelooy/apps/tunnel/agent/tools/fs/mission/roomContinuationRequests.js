// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stores one explicit continuation intention before an agent's first real step.
 * @description
 * The Awtsmoos lets a shliach ask that unfinished work outlive its present vessel.
 * Awtsmoos.com records that request before browser dispatch, so a successor is born
 * from declared custody plus unfinished work, never from an idle timer or stray tab.
 */
function ensure(mission = {}, input = {}) {
	const room = roomOf(mission);
	room.continuationRequests ||= {};
	const logicalAgentId = clean(input.logicalAgentId || input.agentId);
	const generation = positive(input.generation, 1);
	const workId = clean(input.taskId || input.claimId || input.delegationId || input.scope || "work");
	const key = `${logicalAgentId}:g${generation}:${workId}`;
	const existing = room.continuationRequests[key];
	if (existing && existing.status === "active") return existing;
	const now = new Date().toISOString();
	const request = {
		id: `continuation_${safeId(key)}`,
		key,
		missionId: clean(mission.id || mission.missionId),
		roomId: clean(room.id || input.roomId || mission.id),
		logicalAgentId,
		agentSessionId: clean(input.agentSessionId),
		generation,
		spawnGroupId: clean(input.spawnGroupId),
		parentAgentId: clean(input.parentAgentId),
		predecessorAgentId: clean(input.predecessorAgentId),
		taskId: workId,
		claimId: clean(input.claimId),
		delegationId: clean(input.delegationId),
		createdAt: now,
		status: "active",
		successorPolicy: "if_unfinished",
		createdBeforeInitialStep: true
	};
	room.continuationRequests[key] = request;
	return request;
}

function activeFor(mission = {}, logicalAgentId = "", generation = 0) {
	const requests = Object.values(roomOf(mission).continuationRequests || {});
	return requests.find(request => request.status === "active" &&
		(!logicalAgentId || request.logicalAgentId === logicalAgentId) &&
		(!generation || Number(request.generation) === Number(generation))) || null;
}

function fulfill(mission = {}, requestId = "", reason = "work_completed") {
	for (const request of Object.values(roomOf(mission).continuationRequests || {})) {
		if (request.id !== requestId) continue;
		request.status = "fulfilled_without_successor";
		request.fulfilledAt = new Date().toISOString();
		request.fulfilledReason = clean(reason);
		return request;
	}
	return null;
}

function roomOf(mission) {
	if (mission.room && typeof mission.room === "object") return mission.room;
	if (mission.collaboration && typeof mission.collaboration === "object") return mission.collaboration;
	mission.room = {};
	return mission.room;
}

function safeId(value) { return clean(value).replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 140); }
function clean(value) { return String(value || "").trim(); }
function positive(value, fallback) { const number = Number(value); return Number.isSafeInteger(number) && number >= 1 ? number : fallback; }

module.exports = { activeFor, ensure, fulfill, roomOf };
