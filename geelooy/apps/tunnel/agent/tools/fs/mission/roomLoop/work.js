// B"H
// Boruch Hashem
// Blessed is He
const Inbox = require("./inbox.js");
const WakeGate = require("../roomWakeGate.js");
/**
 * The Awtsmoos wakes one logical agent without letting repeated control nudges manufacture
 * duplicate discovery, presence, or brainstorm artifacts inside one bounded cooldown.
 */
async function wakeAgent(config, mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	let check = WakeGate.evaluate(room, input, agentId);
	if (check.coalesced && !room.agents[agentId]) {
		check = WakeGate.evaluate(room, { ...input, forceWake: true }, agentId);
	}
	if (check.coalesced) return coalescedWake(mission, input, env, room, check);
	const found = await env.roomFindActive(config, input);
	const agent = env.roomJoin(mission, input);
	const brainstorm = env.RoomMessages.brainstorm(mission, {
		...input,
		prompt: input.prompt || "Brainstorm before claiming non-overlapping room work"
	}, env);
	const box = Inbox.inbox(mission, input, env);
	const pulse = loopPulse(mission, input, env);
	const wake = WakeGate.commit(room, check);
	return wakeResult({ found, agent, brainstorm, box, pulse, wake, coalesced: false }, mission);
}
function coalescedWake(mission, input, env, room, check) {
	const pulse = loopPulse(mission, input, env);
	const box = pulse.inbox || Inbox.inbox(mission, input, env);
	const agent = room.agents[check.agentId];
	const wake = WakeGate.commitCoalesced(room, check);
	return wakeResult({ found: null, agent, brainstorm: null, box, pulse, wake, coalesced: true }, mission);
}
function wakeResult(values, mission) {
	return {
		ok: true,
		found: values.found,
		agent: values.agent,
		brainstorm: values.brainstorm,
		inbox: values.box,
		pulse: values.pulse,
		wake: values.wake,
		coalesced: values.coalesced,
		nextRequiredAction: values.pulse.mustCallNext || values.box.mustCallNext || {
			action: "missionRoomLoopPulse",
			missionId: mission.id,
			agentId: values.agent.agentId
		}
	};
}
function loopPulse(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const box = Inbox.inbox(mission, { ...input, acknowledge: false }, env);
	const conflicts = fileConflicts(room);
	if (conflicts.length) {
		return pulse("blocked_file_conflict", agentId, {
			inbox: box,
			conflicts,
			mustCallNext: {
				action: "missionRoomReleaseFile",
				missionId: mission.id,
				agentId
			}
		});
	}
	if (box.interrupts.length) {
		return pulse("blocked_interrupt", agentId, {
			inbox: box,
			mustCallNext: env.RoomInterrupts.mustCallNext(mission, env)
		});
	}
	if (box.mustCallNext) {
		return pulse("peer_response_required", agentId, {
			inbox: box,
			mustCallNext: box.mustCallNext
		});
	}
	const claim = box.claims[0] || room.claims.find(item => item.status === "active");
	const next = claim ? {
		action: "missionRoomHeartbeat",
		missionId: mission.id,
		agentId,
		status: "working",
		currentWork: claim.title
	} : {
		action: "missionRoomBrainstorm",
		missionId: mission.id,
		agentId,
		prompt: "No active claim. Brainstorm and claim non-overlapping work."
	};
	return pulse(claim ? "execute_claim" : "brainstorm", agentId, {
		inbox: box,
		mustCallNext: next
	});
}
function fileConflicts(room) {
	const groups = new Map();
	for (const claim of room.fileClaims || []) {
		if (claim.status !== "active") continue;
		groups.set(claim.file, [...(groups.get(claim.file) || []), claim.agentId]);
	}
	return [...groups.entries()]
		.filter(([, agents]) => new Set(agents).size > 1)
		.map(([file, agents]) => ({ file, agents: [...new Set(agents)] }));
}
function pulse(stage, agentId, extra) {
	return { ok: true, stage, agentId, finalAnswerAllowed: false, mustContinue: true, ...extra };
}
module.exports = { fileConflicts, loopPulse, wakeAgent };
