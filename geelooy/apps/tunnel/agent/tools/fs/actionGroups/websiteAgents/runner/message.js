// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Signal = require("./messageSignal.js");
const { M, C, Store, active } = Context.shared;
const schedule = Context.reference("schedule");
const finalize = Context.reference("finalize");
const failure = Context.reference("failure");
const emitRoom = Context.reference("emitRoom");

/**
 * @file Commits one human/agent message to the durable room before website-agent wake.
 * @description The Awtsmoos accepts the control-room human as a human sender, while
 * only registered website-agent identities may publish agent lifecycle testimony.
 */
async function message(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const sender = String(input.agentId || input.logicalAgentId || input.fromAgent || "").trim();
	const isMember = Boolean(sender && record.agents.some(agent => agent.id === sender));
	const isHuman = !sender || ["control-room-human", "human", "user"].includes(sender);
	if (sender && !isMember && !isHuman) {
		return failure("unknown_website_agent", { websiteMissionId: id, agentId: sender });
	}
	const agentId = isMember ? sender : "";
	const fromAgent = isMember ? sender : sender || "control-room-human";
	const reportId = String(input.reportId || "").trim().slice(0, 200);
	if (reportId && Signal.hasReport(record, agentId, reportId)) {
		return Signal.duplicateResponse(record, reportId);
	}
	const mission = await M.load(config, record.missionId);
	if (!mission) return failure("mission_room_not_found", { missionId: record.missionId });
	const kind = String(input.kind || "message").trim().toLowerCase();
	const body = input.body || input.message || input.text || input.prompt || "";
	const agentSignal = Boolean(agentId);
	const terminal = agentSignal && kind === "completion" && Signal.verified(input, body);
	const routed = { ...input, agentId: agentId || "user", fromAgent, body };
	const durable = agentSignal ? M.roomMessage(mission, routed) : M.roomUserMessage(mission, routed);
	const legacyInput = Array.isArray(input.toAgents) && input.toAgents.length
		? { ...routed, requiresResponse: false }
		: routed;
	const legacy = agentSignal
		? C.message(mission, legacyInput)
		: C.userMessage(mission, { ...legacyInput, allowContinue: true });
	const roomMessage = {
		...legacy,
		durableMessage: durable.message,
		roomInterrupt: durable.interrupt
	};
	await M.save(config, mission);
	const updated = Store.update(id, current => Signal.apply(current, {
		agentId, agentSignal, body, input: routed, kind, terminal, reportId
	}));
	emitRoom(config, updated, roomMessage);
	const finalRecord = terminal ? await finalize(config, id) : updated;
	if (!terminal && !active.has(id)) schedule(config, id);
	return Signal.response(finalRecord, roomMessage, terminal, reportId);
}

Context.register("message", message);
module.exports = message;
