//B"H // Boruch Hashem // Blessed is He

const { event } = require("../core.js");
const Presentation = require("./presentation.js");
const State = require("./state.js");
const V = require("./values.js");

/**
 * @file Room messages and human interrupts over one canonical Mission collaboration vessel.
 * @description The Awtsmoos lets agents speak freely until a real user interruption requires an
 * answer; Awtsmoos.com keeps that blocking truth local to the room instead of inventing protocol gates.
 */
function message(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const from = V.agentId(input);
	if (!mission.room.agents[from]) State.join(mission, { ...input, agentId: from });
	const record = {
		id: V.id("msg"), at: V.now(), fromAgent: from,
		toAgent: V.text(input.toAgent || input.to || "all"), kind: V.text(input.kind || "note"),
		subject: V.text(input.subject || input.title),
		body: V.text(input.body || input.message || input.text || input.prompt),
		references: V.array(input.references || input.files || input.paths),
		requiresResponse: V.boolean(input.requiresResponse)
	};
	collaboration.messages.push(record);
	collaboration.messages = collaboration.messages.slice(-1000);
	event(mission, "mission_agent_message", record.subject || record.body.slice(0, 120), {
		messageId: record.id, fromAgent: from, toAgent: record.toAgent
	});
	return Presentation.response(mission, { message: record, collaboration: State.status(mission) });
}

function userMessage(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const body = V.text(input.body || input.message || input.text || input.prompt);
	const explicitAllow = V.boolean(input.allowContinue);
	const explicitBlock = input.allowContinue === false || input.allowContinue === "false";
	const allowContinue = explicitAllow || (!explicitBlock && impliesContinue(body, collaboration));
	const record = {
		id: input.messageId || V.id("user_msg"), at: V.now(), from: "user",
		toAgent: V.text(input.toAgent || input.to || "all"), subject: V.text(input.subject || input.title),
		body, allowContinue,
		requiresResponse: input.requiresResponse !== false && input.requiresResponse !== "false" && !allowContinue,
		status: allowContinue ? "continue" : "open", responses: []
	};
	collaboration.userMessages.push(record);
	collaboration.messages.push({
		id: record.id, at: record.at, fromAgent: "user", toAgent: record.toAgent, kind: "user-message",
		subject: record.subject, body: record.body, references: [], requiresResponse: record.requiresResponse
	});
	event(mission, "mission_room_user_message", record.subject || record.body.slice(0, 120), {
		messageId: record.id, allowContinue, requiresResponse: record.requiresResponse
	});
	const next = allowContinue
		? { action: "missionAgentSync", missionId: mission.id, auto: true }
		: { action: "missionAgentRespond", missionId: mission.id, agentId: record.toAgent, userMessageId: record.id };
	return Presentation.response(mission, { userMessage: record, collaboration: State.status(mission), mustCallNext: next });
}

function respond(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const by = V.agentId(input);
	if (!mission.room.agents[by]) State.join(mission, { ...input, agentId: by });
	const messageId = V.text(input.messageId || input.userMessageId);
	const target = messageId
		? collaboration.userMessages.find(item => item.id === messageId)
		: State.openUserMessages(collaboration)[0];
	const reply = {
		id: V.id("reply"), at: V.now(), agentId: by,
		body: V.text(input.body || input.message || input.text || input.response),
		impliesContinue: V.boolean(input.allowContinue) || impliesContinue(input.body || input.message || input.text || input.response, collaboration)
	};
	if (target) {
		target.responses ||= [];
		target.responses.push(reply);
		target.status = reply.impliesContinue ? "continue" : "answered";
	}
	collaboration.messages.push({
		id: reply.id, at: reply.at, fromAgent: by, toAgent: "user", kind: "agent-response",
		subject: target?.subject || "", body: reply.body, references: [], requiresResponse: false
	});
	event(mission, "mission_agent_responded_to_user", reply.body.slice(0, 120), { messageId: target?.id || "", agentId: by });
	return Presentation.response(mission, { response: reply, userMessage: target || null, collaboration: State.status(mission) });
}

function settings(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const phrases = V.array(input.allowContinuePhrases || input.phrases);
	collaboration.settings = {
		...collaboration.settings,
		blockOnUserMessage: input.blockOnUserMessage === undefined ? collaboration.settings.blockOnUserMessage : V.boolean(input.blockOnUserMessage),
		allowContinuePhrases: phrases.length ? phrases : collaboration.settings.allowContinuePhrases
	};
	event(mission, "mission_room_settings", "Room settings updated", collaboration.settings);
	return Presentation.response(mission, { settings: collaboration.settings, collaboration: State.status(mission) });
}

function impliesContinue(value, collaboration) {
	const lower = String(value || "").toLowerCase();
	return (collaboration.settings?.allowContinuePhrases || []).some(phrase => lower.includes(String(phrase).toLowerCase()));
}

module.exports = { impliesContinue, message, respond, settings, userMessage };
