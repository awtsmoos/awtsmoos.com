// B"H
// Boruch Hashem
// Blessed is He

const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");

/**
 * @file Builds deterministic Mission Room succession fixtures without hiding test intent.
 * @description
 * The Awtsmoos lets the test describe one predecessor and one unfinished deed clearly.
 * Awtsmoos.com keeps bulky fixture construction outside the behavioral witness so the
 * actual succession assertions remain small, readable, and generation-aware.
 */
function mission(oldAt) {
	return {
		id: "mission-successor",
		goal: "finish inherited mission work",
		status: "active",
		phase: "implementation",
		tasks: [
			{ id: "task-done", title: "already completed", status: "done" },
			{ id: "task-open", title: "continue this work", status: "open" }
		],
		room: {
			id: "room-successor",
			agents: {
				old: { agentId: "worker-old", status: "active", generation: 1, lastSeenAt: oldAt }
			},
			claims: [{
				id: "claim-open",
				agentId: "worker-old",
				taskId: "task-open",
				title: "task-open",
				status: "active",
				generation: 1
			}],
			handoffs: [{
				id: "handoff-1",
				staleAgentId: "worker-old",
				messages: [{ id: "m1", body: "continue task-open" }]
			}]
		}
	};
}

function lock(missionId, oldAt) {
	return {
		missionId,
		startedAt: oldAt,
		updatedAt: oldAt,
		lastMustCallNext: {
			action: "missionStepExecute",
			payload: { taskId: "task-open" }
		}
	};
}

function dependencies(missionValue, lockValue) {
	let record = null;
	let prompt = "";
	let dispatches = 0;
	const state = {
		read: () => record,
		acquire: (_config, identity) => {
			record = { ...identity, status: "dispatching", attempts: 1 };
			return { ok: true, record };
		},
		mark: (_config, current, status, details) => {
			record = { ...current, ...details, status };
			return record;
		}
	};
	return {
		deps: {
			Mission: { load: async () => missionValue },
			Lock: { active: () => lockValue },
			WebsiteStore: { read: () => null },
			State: state,
			Eligibility,
			Dispatch: {
				dispatch: async (_config, input) => {
					dispatches += 1;
					prompt = input.prompt;
					return { ok: true, recovered: false };
				}
			}
		},
		dispatchCount: () => dispatches,
		prompt: () => prompt,
		record: () => record
	};
}

module.exports = { dependencies, lock, mission };
