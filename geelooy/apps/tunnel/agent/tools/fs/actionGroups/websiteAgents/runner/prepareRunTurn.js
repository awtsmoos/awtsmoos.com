//B"H
//Boruch Hashem
//Blessed be He

const ContinuationRequests = require("../../../mission/roomContinuationRequests.js");
const Context = require("./context.js");
const RoomTurnContext = require("./roomTurnContext.js");
const TurnPrompt = require("./turnPrompt.js");
const { Store } = Context.shared;
const paceWebsiteStart = Context.reference("paceWebsiteStart");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Reads each agent's sequenced inbox before composing its next physical website turn.
 * @description
 * The Awtsmoos refuses to let addressed peer speech vanish between durable room and browser vessel;
 * Awtsmoos.com acknowledges the exact inbox first, then records this agent's plan in the same river.
 */
async function prepareRunTurn(config, id, agentId, round, continuation) {
	let record = beginTurn(id, agentId, round, continuation);
	let agent = record.agents.find(item => item.id === agentId);
	let continuationRequest = null;
	const room = await withMission(config, record.missionId, mission => {
		continuationRequest = ContinuationRequests.ensure(mission, continuationIdentity(agent));
		RoomTurnContext.heartbeat(mission, agent, "working", `Starting website turn ${round}.`);
		const view = RoomTurnContext.open(mission, agent);
		RoomTurnContext.plan(mission, agent, round, continuation);
		return view;
	});
	record = Store.read(id);
	agent = record.agents.find(item => item.id === agentId);
	const prompt = TurnPrompt.turnPrompt(record, agent, room, round, continuation);
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (target) {
			target.roomMessageCursor = room.turnInbox?.cursorAfter || target.roomMessageCursor || 0;
			target.roomCursorAt = room.turnInbox?.messages?.at(-1)?.at || target.roomCursorAt;
			target.continuationRequestId = continuationRequest?.id || target.continuationRequestId;
		}
		return current;
	});
	await paceWebsiteStart(config, id, agent);
	return { agent, prompt, record, continuationRequest, room };
}

function continuationIdentity(agent) {
	return {
		agentId: agent.id,
		logicalAgentId: agent.logicalAgentId || agent.id,
		agentSessionId: agent.agentSessionId,
		generation: agent.generation,
		spawnGroupId: agent.spawnGroupId,
		parentAgentId: agent.parentAgentId,
		predecessorAgentId: agent.predecessorAgentId,
		claimId: agent.claimId,
		delegationId: agent.delegationId,
		scope: agent.scope
	};
}

function beginTurn(id, agentId, round, continuation) {
	return Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		agent.status = "submitting";
		agent.submissionAcceptedAt = null;
		agent.error = null;
		agent.roomDirty = false;
		agent.pendingRoomMessages = 0;
		current.events.push(event("agent_turn_started", { agentId, round, continuation, scope: agent.scope }));
		return current;
	});
}

module.exports = prepareRunTurn;
