// B"H
// Boruch Hashem
// Blessed is He

const ContinuationRequests = require("../../mission/roomContinuationRequests.js");
const TaskLease = require("../../mission/autoContinuation/taskLease.js");

/**
 * @file Builds truthful recovery testimony for autonomous continuation tests.
 * @description
 * The Awtsmoos does not replace a Shliach from silence alone; two witnesses must agree.
 * Awtsmoos.com joins declared continuation with unfinished custody, and a successor finds the way.
 */
function attachRecoverableWork(mission, oldAt, input = {}) {
	const agentId = input.agentId || "agent_predecessor";
	const taskId = input.taskId || "task_continue";
	const claimId = input.claimId || "claim_continue";
	mission.room ||= {};
	mission.room.agents = [{
		agentId,
		generation: 1,
		status: "working",
		joinedAt: oldAt,
		lastSeenAt: oldAt
	}];
	mission.room.claims = [{
		id: claimId,
		agentId,
		taskId,
		generation: 1,
		status: "active"
	}];
	const continuation = ContinuationRequests.ensure(mission, {
		logicalAgentId: agentId,
		agentSessionId: input.agentSessionId || "session_predecessor",
		generation: 1,
		taskId,
		claimId
	});
	const predecessor = { agentId, generation: 1 };
	const taskLease = TaskLease.select(mission, predecessor, Date.now());
	return { agentId, claimId, continuation, predecessor, taskId, taskLease };
}

/** Creates isolated dispatch/state dependencies while keeping website recovery observable. */
function fakeDependencies(currentMission, currentLock, Eligibility) {
	let record = null;
	let website = null;
	let dispatches = 0;
	const state = {
		read() {
			return record;
		},
		acquire(_config, identity) {
			record = { ...identity, status: "dispatching", attempts: 1 };
			return { ok: true, record };
		},
		mark(_config, current, status, details) {
			record = { ...current, ...details, status };
			return record;
		}
	};
	const missionApi = {
		async load() {
			return currentMission;
		}
	};
	const lockApi = {
		active() {
			return currentLock;
		}
	};
	const websiteStore = {
		read() {
			return website;
		}
	};
	const dispatchApi = {
		async dispatch() {
			dispatches += 1;
			return { ok: true, recovered: false };
		}
	};
	return {
		deps: {
			Mission: missionApi,
			Lock: lockApi,
			WebsiteStore: websiteStore,
			State: state,
			Eligibility,
			Dispatch: dispatchApi
		},
		dispatchCount() {
			return dispatches;
		},
		setWebsite(value) {
			website = value;
		}
	};
}

module.exports = { attachRecoverableWork, fakeDependencies };
