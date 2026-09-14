// B"H
// Boruch Hashem
// Blessed is He

const Journal = require("./roomInterruptJournal.js");
const Recipients = require("./roomRecipients.js");
const Recovery = require("./roomInterruptRecovery.js");

/**
 * @file Preserves blocking interrupts with one/some/all/team recipient metadata.
 * @description
 * The Awtsmoos lets urgency interrupt only the shliach actually addressed. Selected
 * recipients acknowledge one shared interrupt independently without duplicating speech.
 */
function create(mission, input = {}, env) {
	const room = env.RoomState.ensure(mission, input);
	room.interrupts ||= [];
	const route = Recipients.normalize(input, env.RoomState.text);
	const interrupt = {
		id: input.interruptId || env.RoomState.id("room_interrupt"),
		at: env.RoomState.now(),
		fromAgent: env.RoomState.text(input.fromAgent || input.agentId || "user"),
		...route,
		messageId: env.RoomState.text(input.messageId || ""),
		reason: env.RoomState.text(input.reason || "room_message_interrupt"),
		status: "blocking",
		recoveredByAgents: [],
		suspendedWorkQuoted: quote(
			input.currentWork || input.suspendedWork || input.currentAction || room.currentWork || ""
		),
		recoveryRequiredBy: route.toAgent
	};
	room.interrupts.push(interrupt);
	room.currentWork = "";
	Journal.created(mission, input, interrupt, env);
	return interrupt;
}

function quote(value) {
	const text = String(value || "No current work was supplied.").trim();
	return text.split("\n").map(line => `> ${line}`).join("\n");
}

function blocking(mission, recipient = null) {
	if (!mission.room || !Array.isArray(mission.room.interrupts)) return [];
	const recipientId = Recipients.recipientRecord(recipient).agentId;
	return mission.room.interrupts.filter(item =>
		Recovery.stillBlocks(item, recipientId)
		&& (!recipient || Recipients.addressedTo(item, recipient))
	);
}

function recover(mission, input = {}, env) {
	const room = env.RoomState.ensure(mission, input);
	room.interrupts ||= [];
	const agentId = env.RoomState.agentId(input);
	const recipient = room.agents?.[agentId] || agentId;
	const target = room.interrupts.find(item => item.id === input.interruptId)
		|| blocking(mission, recipient)[0];
	if (!target) return { ok: false, error: "no_blocking_interrupt" };
	if (!Recipients.addressedTo(target, recipient)) {
		return { ok: false, error: "interrupt_not_addressed_to_agent" };
	}
	Recovery.recover(target, agentId, input, env);
	const remainingAgents = Recovery.remaining(target);
	Journal.recovered(mission, input, target, remainingAgents, env);
	return { ok: true, interrupt: target, remainingAgents };
}

function mustCallNext(mission, recipient = null) {
	const hit = blocking(mission, recipient)[0];
	if (!hit) return null;
	const agent = Recipients.recipientRecord(recipient).agentId;
	return {
		action: "missionRoomRecoverInterrupt",
		missionId: mission.id,
		interruptId: hit.id,
		agentId: agent || hit.toAgents?.[0] ||
			(hit.recoveryRequiredBy === "any_agent" ? "agent" : hit.recoveryRequiredBy),
		toSpawnGroup: hit.toSpawnGroup || undefined
	};
}

module.exports = { blocking, create, mustCallNext, quote, recover };
