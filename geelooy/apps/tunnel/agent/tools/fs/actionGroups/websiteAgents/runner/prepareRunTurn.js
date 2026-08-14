// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { C, Prompt, Store } = Context.shared;
const paceWebsiteStart = Context.reference("paceWebsiteStart");
const turnPlanMessage = Context.reference("turnPlanMessage");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Prepares durable mission state and the one submit-only browser prompt.
 * @description
 * From the Awtsmoos flows a plan into the room before any tab opens. The agent sees
 * current peers, scope, and handoffs; Awtsmoos.com then paces the single-tab lane.
 */
async function prepareRunTurn(config, id, agentId, round, continuation) {
	let record = Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		agent.status = "submitting";
		agent.submissionAcceptedAt = null;
		agent.error = null;
		agent.roomDirty = false;
		agent.pendingRoomMessages = 0;
		current.events.push(event("agent_turn_started", {
			agentId,
			round,
			continuation,
			scope: agent.scope
		}));
		return current;
	});
	let agent = record.agents.find(item => item.id === agentId);
	const room = await withMission(config, record.missionId, mission => {
		heartbeat(mission, agent, "working", `Starting website turn ${round}.`);
		C.message(mission, {
			agentId: agent.id,
			agentName: agent.name,
			role: agent.role,
			toAgent: "all",
			kind: continuation ? "website-agent-handoff-resume" : "website-agent-plan",
			subject: continuation
				? `Resuming unfinished work: ${agent.scope}`
				: `Plan for turn ${round}: ${agent.scope}`,
			body: turnPlanMessage(agent, round, continuation),
			references: [agent.scope, ...(agent.lastOutcome?.files || [])]
		});
		return C.status(mission);
	});
	const latestMessage = room.messages?.[room.messages.length - 1];
	record = Store.read(id);
	agent = record.agents.find(item => item.id === agentId);
	const prompt = continuation
		? Prompt.unfinishedTurn(record, agent, room)
		: round === 1
			? Prompt.firstTurn(record, agent, room)
			: Prompt.collaborationTurn(record, agent, room);
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (target) target.roomCursorAt = latestMessage?.at || target.roomCursorAt;
		return current;
	});
	await paceWebsiteStart(config, id, agent);
	return { agent, prompt, record };
}

module.exports = prepareRunTurn;
