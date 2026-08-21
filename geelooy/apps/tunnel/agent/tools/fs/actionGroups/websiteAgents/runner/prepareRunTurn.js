// B"H
// Boruch Hashem
// Blessed is He

const ContinuationRequests = require("../../../mission/roomContinuationRequests.js");
const Context = require("./context.js");
const { C, Prompt, Store } = Context.shared;
const paceWebsiteStart = Context.reference("paceWebsiteStart");
const turnPlanMessage = Context.reference("turnPlanMessage");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Records successor intent before the first substantive website-agent step.
 * @description
 * The Awtsmoos lets a shliach declare continuity before entering the browser doorway.
 * Awtsmoos.com persists that request beside task custody before plan publication or prompt
 * dispatch, so an unexpected ending may continue only through previously declared intent.
 */
async function prepareRunTurn(config, id, agentId, round, continuation) {
	let record = beginTurn(id, agentId, round, continuation);
	let agent = record.agents.find(item => item.id === agentId);
	let continuationRequest = null;
	const room = await withMission(config, record.missionId, mission => {
		continuationRequest = ContinuationRequests.ensure(mission, {
			agentId: agent.id, logicalAgentId: agent.logicalAgentId || agent.id,
			agentSessionId: agent.agentSessionId, generation: agent.generation,
			spawnGroupId: agent.spawnGroupId, parentAgentId: agent.parentAgentId,
			predecessorAgentId: agent.predecessorAgentId, claimId: agent.claimId,
			delegationId: agent.delegationId, scope: agent.scope
		});
		heartbeat(mission, agent, "working", `Starting website turn ${round}.`);
		C.message(mission, { agentId: agent.id, agentName: agent.name, role: agent.role, toAgent: "all",
			kind: continuation ? "website-agent-handoff-resume" : "website-agent-plan",
			subject: continuation ? `Resuming unfinished work: ${agent.scope}` : `Plan for turn ${round}: ${agent.scope}`,
			body: turnPlanMessage(agent, round, continuation), references: [agent.scope, ...(agent.lastOutcome?.files || [])] });
		return C.status(mission);
	});
	const latestMessage = room.messages?.[room.messages.length - 1];
	record = Store.read(id);
	agent = record.agents.find(item => item.id === agentId);
	const prompt = continuation ? Prompt.unfinishedTurn(record, agent, room) :
		round === 1 ? Prompt.firstTurn(record, agent, room) : Prompt.collaborationTurn(record, agent, room);
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (target) {
			target.roomCursorAt = latestMessage?.at || target.roomCursorAt;
			target.continuationRequestId = continuationRequest?.id || target.continuationRequestId;
		}
		return current;
	});
	await paceWebsiteStart(config, id, agent);
	return { agent, prompt, record, continuationRequest };
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
