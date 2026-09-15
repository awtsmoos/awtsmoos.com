//B"H
// Boruch Hashem
// Blessed is He

const Ids = require("./ids.js");
const Lifecycle = require("./lifecycleEvent.js");
const Relations = require("./relationStore.js");

/**
 * @file Records meaningful disposable-session incarnations without logging heartbeat noise.
 * @description Chats may vanish while the shlichus remains; the Awtsmoos preserves lineage,
 * and Awtsmoos.com remembers which passing vessel served which enduring logical agent.
 */
function snapshot(session = {}) {
	return {
		id: session.id || "",
		logicalAgentId: session.logicalAgentId || "",
		role: session.role || "",
		status: session.status || "",
		activeMissionId: session.activeMissionId || "",
		lastAssignment: session.lastAssignment ? {
			missionId: session.lastAssignment.missionId || "",
			workId: session.lastAssignment.workId || "",
			reason: session.lastAssignment.reason || ""
		} : null,
		replacementOf: session.replacementOf || "",
		replacedBy: session.replacedBy || "",
		replacementNeeded: Boolean(session.replacementNeeded),
		replacementRequestedAt: session.replacementRequestedAt || "",
		replacementRequestId: session.replacementRequestId || "",
		recoveredAt: session.recoveredAt || "",
		startedAt: session.startedAt || "",
		endedAt: session.endedAt || ""
	};
}

function transition(previous, current) {
	if (!previous) return current.replacementOf
		? "agent.session.replacementOpened" : "agent.session.opened";
	if (previous.replacementRequestedAt !== current.replacementRequestedAt
		&& current.replacementRequestedAt) return "agent.session.replacementRequested";
	if (previous.replacedBy !== current.replacedBy && current.replacedBy) {
		return "agent.session.replaced";
	}
	if (JSON.stringify(previous.lastAssignment || null)
		!== JSON.stringify(current.lastAssignment || null)) return "agent.session.assigned";
	if (previous.status !== current.status && current.endedAt) return "agent.session.closed";
	return "agent.session.updated";
}

async function relations(config, previous, current, eventId) {
	const sessionId = Lifecycle.subject("session", current.id);
	const agentId = Lifecycle.subject("agent", current.logicalAgentId || "agent");
	if (!previous) {
		await Relations.create(config, {
			id: Ids.deterministic("relation", ["incarnationOf", sessionId, agentId]),
			type: "incarnationOf", from: sessionId, to: agentId, sourceEventId: eventId
		});
	}
	if (!previous && current.replacementOf) {
		await Relations.create(config, {
			type: "replaces",
			from: sessionId,
			to: Lifecycle.subject("session", current.replacementOf),
			sourceEventId: eventId
		});
	}
	if (current.replacedBy && previous?.replacedBy !== current.replacedBy) {
		await Relations.create(config, {
			type: "replacedBy",
			from: sessionId,
			to: Lifecycle.subject("session", current.replacedBy),
			sourceEventId: eventId
		});
	}
}

async function shadow(config, previous, current = {}) {
	if (!current.id || !current.logicalAgentId) return { ok: true, emitted: false };
	const before = snapshot(previous || {});
	const after = snapshot(current);
	if (previous && JSON.stringify(before) === JSON.stringify(after)) {
		return { ok: true, emitted: false };
	}
	const type = transition(previous ? before : null, after);
	const discriminator = Ids.sha256(JSON.stringify(after));
	const result = await Lifecycle.bestEffort(config, {
		type,
		identity: `session:${current.id}:${discriminator}`,
		discriminator,
		missionId: after.activeMissionId,
		workId: after.lastAssignment?.workId || "",
		actor: { logicalAgentId: after.logicalAgentId, agentSessionId: current.id },
		subjects: [
			Lifecycle.subject("session", current.id),
			Lifecycle.subject("agent", after.logicalAgentId)
		],
		facts: after
	});
	if (result.ok) await relations(config, previous, current, result.eventId).catch(() => null);
	return { ...result, emitted: result.ok };
}

module.exports = { shadow, snapshot, transition };
