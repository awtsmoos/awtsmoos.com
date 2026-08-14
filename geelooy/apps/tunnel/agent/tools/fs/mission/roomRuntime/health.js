// B"H
// Boruch Hashem
// Blessed is He

const Graph = require("./graph.js");
const Policy = require("./workPolicy.js");
const Work = require("./work.js");

/**
 * @file Turns scheduler state into starvation, ownership, and backlog truth.
 * @description The Awtsmoos does not confuse a quiet room with a healthy room;
 * Awtsmoos.com names pressure by queue, agent, age, and ownership before choosing a breath.
 */
function health(room, now = Date.now()) {
	const all = Work.candidates(room, now);
	const runnable = all.filter(candidate => candidate.runnable !== false);
	const states = Object.keys(room.agentRuntime || {}).map(agentId => Policy.runtimeEligibility(room, agentId, now));
	const queueDepthByKind = countBy(all.filter(candidate => candidate.queueName), "kind");
	const ownershipConflicts = claimConflicts(room);
	const openInterrupts = (room.interrupts || []).filter(item => item.status === "blocking").length;
	const oldestRunnableAgeMs = runnable.reduce((max, candidate) => Math.max(max, candidate.ageMs || 0), 0);
	const staleAgents = states.filter(state => state.stale || state.ended || state.leaseInactive).map(state => state.agentId);
	const architectureScore = score({
		openInterrupts,
		ownershipConflicts: ownershipConflicts.length,
		staleAgents: staleAgents.length,
		oldestRunnableAgeMs
	});
	return {
		architectureScore,
		staleAgents,
		eligibleAgents: states.filter(state => state.eligible).map(state => state.agentId),
		openInterrupts,
		blockingInterrupts: openInterrupts,
		activeClaims: Work.activeClaims(room).length,
		ownershipConflicts,
		queueDepthByKind,
		runnableCandidates: runnable.length,
		oldestRunnableAgeMs,
		fairness: Work.fairness(room, all),
		nextHighestWork: Work.nextHighestWork(room, now)
	};
}

function scheduler(room) {
	return {
		defaultLoop: ["discover", "plan", "claim", "execute", "verify", "review", "self critique", "refactor", "look for more"],
		guidance: "Steer toward the highest-value unfinished work. Quiet queues trigger discovery, never implicit completion.",
		stopRule: "explicit_verified_user_stop_only",
		agents: Object.values(room.agentRuntime || {}),
		health: health(room),
		missionGraph: Graph.graph(room)
	};
}

function claimConflicts(room) {
	const owners = new Map();
	for (const claim of Work.activeClaims(room)) {
		const taskKey = String(claim.taskId || claim.title || claim.id || "");
		if (!taskKey) continue;
		const list = owners.get(taskKey) || [];
		list.push(claim.agentId);
		owners.set(taskKey, list);
	}
	return [...owners.entries()]
		.filter(([, agents]) => new Set(agents).size > 1)
		.map(([taskKey, agents]) => ({ taskKey, agents: [...new Set(agents)] }));
}

function countBy(items, field) {
	const result = {};
	for (const item of items) result[item[field]] = (result[item[field]] || 0) + 1;
	return result;
}

function score({ openInterrupts, ownershipConflicts, staleAgents, oldestRunnableAgeMs }) {
	const starvationPenalty = Math.min(20, Math.floor(oldestRunnableAgeMs / (5 * 60 * 1000)) * 2);
	return Math.max(0, 100 - openInterrupts * 8 - ownershipConflicts * 15 - staleAgents * 4 - starvationPenalty);
}

module.exports = { health, scheduler };
