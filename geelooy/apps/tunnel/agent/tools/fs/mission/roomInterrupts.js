// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves blocking room interrupts with direct or spawn-group routing.
 * @description
 * The Awtsmoos lets urgency interrupt only the vessel that truly owns the call.
 * Awtsmoos.com carries group identity beside direct identity, so a sibling warning
 * can awaken one fan-out without turning every unrelated agent's work into a pause.
 */
function create(mission, input = {}, env) {
	const room = env.RoomState.ensure(mission, input);
	room.interrupts ||= [];
	const toSpawnGroup = env.RoomState.text(input.toSpawnGroup || input.spawnGroupTarget || "");
	const interrupt = {
		id: input.interruptId || env.RoomState.id("room_interrupt"),
		at: env.RoomState.now(),
		fromAgent: env.RoomState.text(input.fromAgent || input.agentId || "user"),
		toAgent: env.RoomState.text(input.toAgent || input.to || (toSpawnGroup ? "spawn_group" : "all")),
		toSpawnGroup,
		messageId: env.RoomState.text(input.messageId || ""),
		reason: env.RoomState.text(input.reason || "room_message_interrupt"),
		status: "blocking",
		suspendedWorkQuoted: quote(
			input.currentWork || input.suspendedWork || input.currentAction || room.currentWork || ""
		),
		recoveryRequiredBy: env.RoomState.text(
			input.recoveryRequiredBy || input.toAgent || (toSpawnGroup ? "spawn_group" : "any_agent")
		)
	};
	room.interrupts.push(interrupt);
	room.currentWork = "";
	meta(env, input, mission, "room_interrupt", {
		agentId: interrupt.fromAgent,
		message: interrupt.reason,
		payload: {
			interruptId: interrupt.id,
			messageId: interrupt.messageId,
			toSpawnGroup,
			suspendedWorkQuoted: interrupt.suspendedWorkQuoted
		}
	});
	env.event(mission, "mission_room_interrupt", interrupt.reason, {
		roomId: room.id,
		interruptId: interrupt.id,
		messageId: interrupt.messageId,
		toSpawnGroup: toSpawnGroup || undefined
	});
	return interrupt;
}

function quote(value) {
	const text = String(value || "No current work was supplied.").trim();
	return text.split("\n").map(line => `> ${line}`).join("\n");
}

function blocking(mission) {
	if (!mission.room || !Array.isArray(mission.room.interrupts)) return [];
	return mission.room.interrupts.filter(item => item.status === "blocking");
}

function recover(mission, input = {}, env) {
	const room = env.RoomState.ensure(mission, input);
	room.interrupts ||= [];
	const target = room.interrupts.find(item => item.id === input.interruptId) || blocking(mission)[0];
	if (!target) return { ok: false, error: "no_blocking_interrupt" };
	target.status = "recovered";
	target.recoveredAt = env.RoomState.now();
	target.recoveredBy = env.RoomState.agentId(input);
	target.recoveryNote = env.RoomState.text(
		input.note || input.message || "Recovered interrupt and resumed room protocol."
	);
	meta(env, input, mission, "room_interrupt_recovered", {
		agentId: target.recoveredBy,
		message: target.recoveryNote,
		payload: { interruptId: target.id }
	});
	env.event(mission, "mission_room_interrupt_recovered", target.recoveryNote, {
		roomId: room.id,
		interruptId: target.id,
		agentId: target.recoveredBy
	});
	return { ok: true, interrupt: target };
}

function mustCallNext(mission) {
	const hit = blocking(mission)[0];
	if (!hit) return null;
	return {
		action: "missionRoomRecoverInterrupt",
		missionId: mission.id,
		interruptId: hit.id,
		agentId: hit.recoveryRequiredBy === "any_agent" ? "agent" : hit.recoveryRequiredBy,
		toSpawnGroup: hit.toSpawnGroup || undefined
	};
}

function meta(env, input, mission, kind, data) {
	if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
	return env.MetadataStore.record({
		root: input.__configRoot || input.projectRoot,
		metadataRoot: input.__metadataRoot
	}, mission, kind, data);
}

module.exports = { blocking, create, mustCallNext, quote, recover };
