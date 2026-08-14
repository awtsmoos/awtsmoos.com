// B"H
// Boruch Hashem
// Blessed is He

const Claims = require("./roomClaims.js");

/**
 * @file Keeps split proposals readable while delegating ownership law to one claim engine.
 * @description The Awtsmoos lets many agents agree on a plan, but one task receives one
 * living owner; Awtsmoos.com records reuse, conflict, and takeover rather than duplicating claims.
 */
function proposeSplit(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const byAgent = env.RoomState.agentId(input);
	const tasks = parseTasks(input.tasks || input.splits || input.plan, env);
	const proposal = {
		id: input.proposalId || env.RoomState.id("room_split"),
		at: env.RoomState.now(),
		byAgent,
		title: env.RoomState.text(input.title || "Split workload"),
		rationale: env.RoomState.text(input.rationale || input.reason || "Divide work among specialized agents"),
		status: "proposed",
		tasks,
		acceptedBy: []
	};
	room.splitProposals.push(proposal);
	env.event(mission, "mission_room_split_proposed", proposal.title, {
		roomId: room.id,
		proposalId: proposal.id,
		tasks: tasks.length
	});
	return proposal;
}

function acceptSplit(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const proposal = room.splitProposals.find(item => item.id === input.proposalId) || room.splitProposals.at(-1);
	if (!proposal) return null;
	const agentId = env.RoomState.agentId(input);
	proposal.acceptedBy = [...new Set([...(proposal.acceptedBy || []), agentId])];
	proposal.status = "accepted";
	const agreement = {
		id: env.RoomState.id("room_agreement"),
		at: env.RoomState.now(),
		proposalId: proposal.id,
		agentId,
		status: "accepted",
		note: env.RoomState.text(input.note || "Accepted split")
	};
	room.agreements.push(agreement);
	env.event(mission, "mission_room_split_accepted", proposal.title, {
		roomId: room.id,
		proposalId: proposal.id,
		agentId
	});
	return { proposal, agreement };
}

function claimTask(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const result = Claims.claimTask(room, input, env);
	if (result.conflict) {
		env.event(mission, "mission_room_task_claim_conflict", "Task already has a healthy owner", {
			roomId: room.id,
			taskId: result.taskId,
			claimId: result.claimId,
			ownerAgentId: result.ownerAgentId,
			requestingAgentId: env.RoomState.agentId(input)
		});
		return result;
	}
	if (!result.reused) {
		env.event(mission, "mission_room_task_claimed", result.title, {
			roomId: room.id,
			claimId: result.id,
			agentId: result.agentId,
			takeover: Boolean(result.takeover)
		});
	}
	return result;
}

function parseTasks(value, env) {
	if (Array.isArray(value) && value.length) {
		return value.map((task, index) => normalizeTask(task, index, env));
	}
	return [
		normalizeTask({ title: "Architecture and file map", agentId: "architect", files: ["geelooy/apps/tunnel/agent/tools/fs/mission/core.js"] }, 0, env),
		normalizeTask({ title: "Simulator and regression tests", agentId: "tester", files: ["geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionRoomSimulator.test.mjs"] }, 1, env),
		normalizeTask({ title: "Implementation and merge report", agentId: "implementer", files: ["geelooy/apps/tunnel/agent/tools/fs/mission/roomSimulator.js"] }, 2, env)
	];
}

function normalizeTask(task, index, env) {
	const source = typeof task === "string" ? { title: task } : task || {};
	return {
		id: source.id || `split_task_${index + 1}`,
		title: env.RoomState.text(source.title || source.task || `Split task ${index + 1}`),
		agentId: env.RoomState.text(source.agentId || source.assignee || ["architect", "tester", "implementer"][index] || "agent"),
		role: env.RoomState.text(source.role || "worker"),
		files: env.RoomState.list(source.files || source.paths || source.filesToTouch),
		status: "open"
	};
}

module.exports = { acceptSplit, claimTask, proposeSplit };
