//B"H // Boruch Hashem // Blessed is He

const Heartbeat = require("./roomHeartbeat.js");
const Record = require("./roomMessageRecord.js");
const Payload = require("../actionGroups/missionRoomMessagePayload.js");

/**
 * @file Commits one normalized, sequenced Mission Room body with stable routing semantics.
 * @description The Awtsmoos lets legacy carriers speak one meaning. Awtsmoos.com normalizes body,
 * kind, subject, and agent aliases before durable storage so completion cannot silently become fs,
 * chat, or empty merely because a wrapper chose a historical payload shape.
 */
function add(mission, input, env) {
	const normalized = Payload.normalize(input);
	const room = env.RoomState.ensure(mission, normalized);
	const kind = env.RoomState.text(normalized.kind || "chat");
	const message = Record.build(
		room,
		normalized,
		env,
		nextSequence(room),
		shouldInterrupt(normalized, kind)
	);
	room.messages.push(message);
	room.messages = room.messages.slice(-2000);
	meta(env, normalized, mission, "room_message", {
		agentId: message.fromAgent,
		subject: message.subject,
		message: message.body,
		payload: {
			messageId: message.id,
			sequence: message.sequence,
			...Record.routing(message),
			kind: message.kind
		}
	});
	const interrupt = createInterrupt(message, mission, normalized, env);
	env.event(mission, "mission_room_message", message.subject || message.body.slice(0, 120), {
		roomId: room.id,
		messageId: message.id,
		sequence: message.sequence,
		fromAgent: message.fromAgent,
		...Record.routing(message),
		kind: message.kind,
		interrupts: message.interrupts
	});
	return { message, interrupt };
}

function createInterrupt(message, mission, input, env) {
	if (!message.interrupts) return null;
	return env.RoomInterrupts.create(mission, {
		...input,
		fromAgent: message.fromAgent,
		toAgent: message.toAgent,
		toAgents: message.toAgents,
		toSpawnGroup: message.toSpawnGroup,
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
	if (Record.truthy(input.requiresResponse)) return true;
	if (["user", "question", "blocker", "urgent"].includes(kind)) return true;
	return !["presence", "plan", "progress", "handoff", "completion", "answer"].includes(kind)
		&& Boolean(input.currentWork || input.currentAction);
}

function nextSequence(room) {
	room.messageSequence = Math.max(0, Number(room.messageSequence || 0)) + 1;
	return room.messageSequence;
}

function brainstorm(mission, input, env) {
	return require("./roomBrainstorm.js").brainstorm(mission, input, env);
}

function meta(env, input, mission, kind, data) {
	if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
	return env.MetadataStore.record({
		root: input.__configRoot || input.projectRoot,
		metadataRoot: input.__metadataRoot
	}, mission, kind, data);
}

module.exports = { add, brainstorm, heartbeat, nextSequence, shouldInterrupt };
