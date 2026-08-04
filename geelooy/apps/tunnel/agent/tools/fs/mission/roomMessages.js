// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Commits sequenced peer messages with explicit interruption semantics.
 * @description
 * The Awtsmoos lets plans, progress, handoffs, completion, and answers flow quietly.
 * Questions, blockers, urgent words, user messages, and generic mid-work chat may
 * interrupt; everything remains durable until each addressed agent advances cursor.
 */
function add(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const fromAgent = input.fromAgent || env.RoomState.agentId(input);
	const kind = env.RoomState.text(input.kind || "chat");
	const sequence = nextSequence(room);
	const message = {
		id: input.messageId || env.RoomState.id("room_msg"),
		sequence,
		at: env.RoomState.now(),
		fromAgent,
		toAgent: env.RoomState.text(input.toAgent || input.to || "all"),
		kind,
		subject: env.RoomState.text(input.subject || input.title),
		body: env.RoomState.text(input.body || input.message || input.text),
		references: env.RoomState.list(input.references || input.files || input.paths),
		requiresResponse: boolean(input.requiresResponse),
		interrupts: shouldInterrupt(input, kind)
	};
	room.messages.push(message);
	room.messages = room.messages.slice(-2000);
	meta(env, input, mission, "room_message", {
		agentId: fromAgent,
		subject: message.subject,
		message: message.body,
		payload: { messageId: message.id, sequence, toAgent: message.toAgent, kind }
	});
	let interrupt = null;
	if (message.interrupts) {
		interrupt = env.RoomInterrupts.create(mission, {
			...input,
			fromAgent,
			messageId: message.id,
			currentWork: input.currentWork || room.currentWork,
			reason: kind === "user" ? "user_message_interrupt" : "agent_message_interrupt"
		}, env);
	}
	env.event(mission, "mission_room_message",
		message.subject || message.body.slice(0, 120), {
			roomId: room.id,
			messageId: message.id,
			sequence,
			fromAgent,
			interrupts: message.interrupts
		});
	return { message, interrupt };
}

function heartbeat(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const beat = {
		id: env.RoomState.id("room_beat"),
		at: env.RoomState.now(),
		agentId,
		status: env.RoomState.text(input.status || "active"),
		currentMissionId: env.RoomState.text(input.currentMissionId || input.subMissionId),
		note: env.RoomState.text(input.note || input.message)
	};
	room.heartbeats.push(beat);
	room.heartbeats = room.heartbeats.slice(-1000);
	if (input.currentWork || input.currentAction) {
		room.currentWork = env.RoomState.text(input.currentWork || input.currentAction);
	}
	if (room.agents[agentId]) room.agents[agentId].lastSeenAt = beat.at;
	meta(env, input, mission, "room_heartbeat", {
		agentId,
		message: beat.note,
		payload: { heartbeatId: beat.id, status: beat.status }
	});
	return beat;
}

function shouldInterrupt(input, kind) {
	if (input.interrupt === true || input.interrupt === "true") return true;
	if (input.interrupt === false || input.interrupt === "false") return false;
	if (boolean(input.requiresResponse)) return true;
	if (["user", "question", "blocker", "urgent"].includes(kind)) return true;
	if (["presence", "plan", "progress", "handoff", "completion", "answer"].includes(kind)) {
		return false;
	}
	return Boolean(input.currentWork || input.currentAction);
}

function nextSequence(room) {
	room.messageSequence = Math.max(0, Number(room.messageSequence || 0)) + 1;
	return room.messageSequence;
}

function brainstorm(mission, input, env) {
	return require("./roomBrainstorm.js").brainstorm(mission, input, env);
}

function boolean(value) {
	return value === true || value === "true";
}

function meta(env, input, mission, kind, data) {
	if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
	return env.MetadataStore.record({
		root: input.__configRoot || input.projectRoot,
		metadataRoot: input.__metadataRoot
	}, mission, kind, data);
}

module.exports = { add, brainstorm, heartbeat, nextSequence, shouldInterrupt };
