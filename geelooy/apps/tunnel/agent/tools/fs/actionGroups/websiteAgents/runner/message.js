// B"H
const Context = require("./context.js");
const Signal = require("./messageSignal.js");
const { M, C, Store, active } = Context.shared;
const schedule = Context.reference("schedule");
const finalize = Context.reference("finalize");
const failure = Context.reference("failure");
const emitRoom = Context.reference("emitRoom");

/** Delivers one idempotent human or verified member-agent lifecycle signal. */
async function message(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const agentId = String(input.agentId || input.logicalAgentId || "").trim();
	if (agentId && !record.agents.some(agent => agent.id === agentId)) {
		return failure("unknown_website_agent", {
			websiteMissionId: id,
			agentId
		});
	}
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
	const roomMessage = agentSignal
		? C.message(mission, { ...input, body, toAgent: input.toAgent || "all" })
		: C.userMessage(mission, {
			...input, body, toAgent: input.toAgent || "all", allowContinue: true
		});
	await M.save(config, mission);
	const updated = Store.update(id, current => Signal.apply(current, {
		agentId, agentSignal, body, input, kind, terminal, reportId
	}));
	emitRoom(config, updated, roomMessage);
	const finalRecord = terminal ? await finalize(config, id) : updated;
	if (!terminal && !active.has(id)) schedule(config, id);
	return Signal.response(finalRecord, roomMessage, terminal, reportId);
}

Context.register("message", message);
module.exports = message;
