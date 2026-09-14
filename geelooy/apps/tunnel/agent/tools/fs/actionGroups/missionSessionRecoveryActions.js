//B"H
//Boruch Hashem
//Blessed be He

const Recovery = require("../mission/agentSessionRecovery.js");
const Status = require("../mission/assignment/status.js");
const Spawner = require("./missionSessionSpawner.js");

/**
 * @file Recovers exhausted chats first, then maintains useful autonomous Shliach capacity.
 * @description
 * Durable missions outlive browser conversations. Recovery receives priority, while pool
 * refill counts reserved launches immediately so slow Chrome startup cannot multiply agents.
 */
function buildMissionSessionRecoveryActions(context, buildActions) {
	const { config, payload = {}, ws } = context;
	return {
		async missionAgentRecoverySweep() {
			const candidates = await Recovery.candidates(config, payload);
			if (payload.spawn === false || payload.spawn === "false") {
				return { ok: true, action: "missionAgentRecoverySweep", candidates, spawned: [] };
			}
			const limit = bounded(payload.maxNewAgents, 1, 7, 3);
			const spawned = [];
			for (const session of candidates.slice(0, limit)) {
				const result = await Spawner.spawn(buildActions, config, ws, session, payload, spawned.length);
				spawned.push(result);
				if (result.ok) await Recovery.requested(config, session.id, result.websiteMissionId);
			}
			return { ok: spawned.every(item => item.ok), action: "missionAgentRecoverySweep", candidates, spawned };
		},
		async missionAgentEnsurePool() {
			return ensurePool(config, payload, ws, buildActions);
		}
	};
}

async function ensurePool(config, payload, ws, buildActions) {
	const snapshot = await Status.snapshot(config, payload);
	const desired = bounded(payload.desiredAgents, 1, 7, 3);
	const demand = demandSlots(snapshot, desired);
	const needed = Math.max(0, Math.min(desired - snapshot.sessions.active, demand.length));
	const spawned = [];
	for (let index = 0; index < needed; index += 1) {
		const mission = demand[index % demand.length];
		spawned.push(await Spawner.spawn(buildActions, config, ws, null, {
			...payload,
			missionId: mission.missionId,
			projectRoot: mission.projectRoot
		}, index));
	}
	return { ok: spawned.every(item => item.ok), action: "missionAgentEnsurePool", desired, needed, spawned };
}

/** Expands open mission work into bounded useful worker slots without inventing filler. */
function demandSlots(snapshot, maximum) {
	const slots = [];
	for (const mission of snapshot.missions || []) {
		const count = Math.min(maximum, Number(mission.availableCount ?? mission.remainingCount ?? 0));
		for (let index = 0; index < count; index += 1) slots.push(mission);
	}
	return slots.slice(0, maximum);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

module.exports = { bounded, buildMissionSessionRecoveryActions, demandSlots, ensurePool };
