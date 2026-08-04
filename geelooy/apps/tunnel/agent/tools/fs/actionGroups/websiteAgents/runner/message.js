// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	M,
	C,
	Store,
	active
} = Context.shared;
const schedule = Context.reference("schedule");
const status = Context.reference("status");
const failure = Context.reference("failure");
const event = Context.reference("event");
const emitRoom = Context.reference("emitRoom");

/**
 * @file Reveals the message stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function message(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const mission = await M.load(config, record.missionId);
	if (!mission) return failure("mission_room_not_found", { missionId: record.missionId });
	const roomMessage = C.userMessage(mission, {
		...input,
		body: input.body || input.message || input.text || input.prompt,
		toAgent: input.toAgent || "all",
		allowContinue: true
	});
	await M.save(config, mission);
	const target = String(input.toAgent || "all");
	const updated = Store.update(id, current => {
		current.roomRevision += 1;
		for (const agent of current.agents) {
			if (target !== "all" && target !== "any_agent" && target !== agent.id) continue;
			agent.roomDirty = true;
			agent.pendingRoomMessages += 1;
			if (agent.status === "complete") agent.status = "active";
		}
		if (!["awaiting_recovery", "cancelled"].includes(current.status)) {
			current.status = "running";
			current.phase = "room_message_queued";
			current.finishedAt = null;
		}
		current.events.push(event("room_message_queued_for_agents", {
			toAgent: target,
			roomRevision: current.roomRevision
		}));
		return current;
	});
	emitRoom(config, updated, roomMessage);
	if (!active.has(id)) schedule(config, id);
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: id,
		missionId: record.missionId,
		delivery: {
			dashboard: "committed",
			websiteAgents: "next_safe_turn",
			roomRevision: updated.roomRevision
		},
		roomMessage
	};
}

Context.register("message", message);
module.exports = message;
