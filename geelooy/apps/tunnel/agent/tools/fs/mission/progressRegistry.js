// B"H
// Boruch Hashem
// Blessed is He

const Record = require("./workRecord.js");

/**
 * @file Persists structured progress so future agents need not scrape conversational prose.
 * @description
 * The Awtsmoos turns each changing instant into testimony a later vessel can receive;
 * Awtsmoos.com records actor, paths, evidence, and work links so successors can believe.
 */
function ensure(mission) {
	mission.progressEvents ||= [];
	return mission.progressEvents;
}

/** Builds an event-only identity so work IDs never masquerade as progress IDs. */
function eventIdentity(input = {}) {
	const workIds = input.workIds || (input.workId ? [input.workId] : []);
	const witness = [
		input.idempotencyKey,
		input.requestId,
		input.clientRequestId,
		input.type,
		...workIds
	].filter(Boolean).join("|");
	return {
		...input,
		id: input.progressId || undefined,
		idempotencyKey: input.progressId || witness || undefined
	};
}

/** Adds one idempotent progress event and returns the existing witness on replay. */
function register(mission, projectRoot, input = {}) {
	const events = ensure(mission);
	const identity = eventIdentity(input);
	const id = Record.stableId("progress", mission.id, identity);
	const existing = events.find(event => event.id === id);
	if (existing) {
		return { ok: true, replayed: true, event: existing };
	}
	const now = new Date().toISOString();
	const event = {
		id,
		type: input.type || "progress",
		missionId: mission.id,
		logicalAgentId: input.logicalAgentId || input.agentId || "",
		agentSessionId: input.agentSessionId || "",
		workIds: input.workIds || (input.workId ? [input.workId] : []),
		absolutePaths: Record.absolutePaths(projectRoot, input),
		evidence: input.evidence ?? null,
		details: input.details ?? input.description ?? null,
		createdAt: input.createdAt || now,
		updatedAt: now
	};
	events.push(event);
	return { ok: true, replayed: false, event };
}

module.exports = { ensure, eventIdentity, register };
