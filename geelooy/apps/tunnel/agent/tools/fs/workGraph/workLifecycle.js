//B"H
// Boruch Hashem
// Blessed is He

const Ids = require("./ids.js");
const Lifecycle = require("./lifecycleEvent.js");

/**
 * @file Shadows persisted REMAINING_WORK transitions into immutable Chronicle events.
 * @description Work remains owned by mission truth; the Awtsmoos lets every persisted
 * change cast a faithful shadow, and Awtsmoos.com remembers without seizing ownership.
 */
function snapshot(item = {}) {
	return {
		id: item.id || "",
		title: item.title || "",
		state: item.state || "",
		priority: item.priority || "",
		owner: item.owner || "",
		claim: item.claim || null,
		absolutePaths: item.absolutePaths || [],
		verification: item.verification || null,
		origin: item.origin || "",
		blocker: item.blocker || null,
		nextAction: item.nextAction || null,
		createdAt: item.createdAt || "",
		updatedAt: item.updatedAt || ""
	};
}

function equal(left, right) {
	return JSON.stringify(snapshot(left)) === JSON.stringify(snapshot(right));
}

function transition(previous, current) {
	if (!previous) return "work.registered";
	const oldClaim = previous.claim?.sessionId || "";
	const newClaim = current.claim?.sessionId || "";
	if (oldClaim !== newClaim && newClaim) return "work.claimed";
	if (oldClaim && !newClaim) return "work.released";
	if (["completed", "verified"].includes(current.state)
		&& previous.state !== current.state) return "work.completed";
	return "work.updated";
}

function subjects(missionId, item) {
	const values = [
		Lifecycle.subject("mission", missionId),
		Lifecycle.subject("work", [missionId, item.id])
	];
	if (item.claim?.logicalAgentId) {
		values.push(Lifecycle.subject("agent", item.claim.logicalAgentId));
	}
	if (item.claim?.sessionId) {
		values.push(Lifecycle.subject("session", item.claim.sessionId));
	}
	return values;
}

async function emitOne(config, missionId, previous, current) {
	const type = transition(previous, current);
	const facts = snapshot(current);
	const discriminator = Ids.sha256(JSON.stringify(facts));
	return Lifecycle.bestEffort(config, {
		type,
		identity: `work:${missionId}:${current.id}:${discriminator}`,
		discriminator,
		missionId,
		workId: current.id,
		actor: {
			logicalAgentId: current.claim?.logicalAgentId || config.logicalAgentId || "",
			agentSessionId: current.claim?.sessionId || config.agentSessionId || ""
		},
		subjects: subjects(missionId, current),
		facts,
		evidence: current.verification?.evidenceIds || []
	});
}

async function shadow(config, previousMission, mission = {}) {
	const missionId = mission.missionId || mission.id || "";
	if (!missionId) return { ok: true, emitted: 0 };
	const previous = new Map(
		(previousMission?.remainingWork || []).map(item => [item.id, item])
	);
	let emitted = 0;
	for (const item of mission.remainingWork || []) {
		const before = previous.get(item.id);
		if (before && equal(before, item)) continue;
		const result = await emitOne(config, missionId, before, item);
		if (result.ok) emitted += 1;
	}
	return { ok: true, emitted };
}

module.exports = { equal, shadow, snapshot, transition };
