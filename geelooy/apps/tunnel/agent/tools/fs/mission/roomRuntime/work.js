// B"H
// Boruch Hashem
// Blessed is He

const Candidates = require("./workCandidates.js");

/**
 * @file Ranks room work without mutating the room merely because somebody looked.
 * @description The Awtsmoos orders urgency, age, and stable identity into one visible
 * procession; Awtsmoos.com preserves old queue-kind names while revealing semantic kind too.
 */
function activeClaims(room) {
	return (room.claims || []).filter(item => item.status === "active");
}

function candidates(room, now = Date.now()) {
	return Candidates.enumerate(room, now);
}

function runnableCandidates(room, now = Date.now()) {
	return candidates(room, now).filter(candidate => candidate.runnable !== false);
}

function selectCandidate(room, list) {
	return [...list].sort((left, right) => compare(room, left, right))[0] || null;
}

function nextHighestWork(room, now = Date.now()) {
	const selected = selectCandidate(room, runnableCandidates(room, now));
	if (!selected) {
		return {
			kind: "discover",
			semanticKind: "discover",
			priority: 10,
			item: { action: "missionRoomDiscoverAgents" },
			reason: "no_runnable_room_work"
		};
	}
	return {
		kind: selected.queueName || selected.kind,
		semanticKind: selected.kind,
		priority: selected.effectivePriority,
		basePriority: selected.basePriority,
		agentId: selected.agentId,
		queueName: selected.queueName,
		ageMs: selected.ageMs,
		item: selected.item,
		reason: selected.reason
	};
}

function fairness(room, list = candidates(room)) {
	const perAgent = {};
	for (const candidate of list) {
		if (!candidate.agentId || candidate.agentId === "any_agent") continue;
		perAgent[candidate.agentId] = (perAgent[candidate.agentId] || 0) + 1;
	}
	const counts = Object.values(perAgent);
	return {
		perAgentCandidateCount: perAgent,
		spread: counts.length ? Math.max(...counts) - Math.min(...counts) : 0
	};
}

function compare(room, left, right) {
	if (left.effectivePriority !== right.effectivePriority) {
		return right.effectivePriority - left.effectivePriority;
	}
	const dispatchDelta = lastDispatch(room, left.agentId) - lastDispatch(room, right.agentId);
	if (dispatchDelta) return dispatchDelta;
	return left.stableKey.localeCompare(right.stableKey);
}

function lastDispatch(room, agentId) {
	const value = Date.parse(room.agentRuntime?.[agentId]?.lastDispatchedAt || 0);
	return Number.isFinite(value) ? value : 0;
}

module.exports = {
	activeClaims,
	candidates,
	fairness,
	nextHighestWork,
	runnableCandidates,
	selectCandidate
};
