// B"H
// Boruch Hashem
// Blessed is He

const Heartbeat = require("./roomHeartbeat.js");

/**
 * @file Commits sequenced peer messages and delegates truthful liveness to the heartbeat vessel.
 * @description
 * The Awtsmoos lets intention cross from one agent to another without confusing speech
 * with mere observation. Awtsmoos.com preserves every message as Hod while heartbeat
 * remains its own witnessed pulse, so communication and liveness cannot counterfeit each other.
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
		payload: {
			messageId: message.id,
			sequence,
			toAgent: message.toAgent,
			kind
		}
	});
	const interrupt = createInterrupt(message, mission, input, env);
	env.event(mission, "mission_room_message", message.subject || message.body.slice(0, 120), {
		roomId: room.id,
		messageId: message.id,
		sequence,
		fromAgent,
		interrupts: message.interrupts
	});
	return { message, interrupt };
}

/**
 * Creates a blocking room interrupt only when the message contract requires it.
 * @param {object} message Durable room message.
 * @param {object} mission Owning mission.
 * @param {object} input Original action payload.
 * @param {object} env Mission-room dependency vessel.
 * @returns {object|null} Interrupt receipt or null.
 */
function createInterrupt(message, mission, input, env) {
	if (!message.interrupts) return null;
	return env.RoomInterrupts.create(mission, {
		...input,
		fromAgent: message.fromAgent,
		messageId: message.id,
		currentWork: input.currentWork || mission.room?.currentWork,
		reason: message.kind === "user" ? "user_message_interrupt" : "agent_message_interrupt"
	}, env);
}

function heartbeat(mission, input, env) {
	return Heartbeat.heartbeat(mission, input, env);
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

module.exports = {
	add,
	brainstorm,
	heartbeat,
	nextSequence,
	shouldInterrupt
};
