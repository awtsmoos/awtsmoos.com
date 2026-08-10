// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("./roomRuntime.js");

/**
 * @file Commits one truthful agent heartbeat into both public room presence and runtime health.
 * @description
 * A heartbeat is Hod carrying one witnessed pulse into durable vessels. The Awtsmoos
 * recreates every instant, yet Awtsmoos.com must never call silence a pulse: only an
 * actual heartbeat action renews liveness, and one timestamp binds both representations.
 */
function heartbeat(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const timestamp = env.RoomState.now();
	const beat = buildBeat(input, env, agentId, timestamp);
	room.heartbeats.push(beat);
	room.heartbeats = room.heartbeats.slice(-1000);
	if (input.currentWork || input.currentAction) {
		room.currentWork = env.RoomState.text(input.currentWork || input.currentAction);
	}
	if (room.agents[agentId]) {
		room.agents[agentId].lastSeenAt = timestamp;
		room.agents[agentId].status = beat.status;
	}
	Runtime.renewHeartbeat(room, input, agentId, timestamp);
	recordMetadata(env, input, mission, beat);
	return beat;
}

/**
 * Builds the immutable heartbeat receipt shared by room history and runtime liveness.
 * @param {object} input Heartbeat action payload.
 * @param {object} env Mission-room dependency vessel.
 * @param {string} agentId Stable logical agent identity.
 * @param {string} timestamp Exact observed event time.
 * @returns {object} Durable heartbeat receipt.
 */
function buildBeat(input, env, agentId, timestamp) {
	return {
		id: env.RoomState.id("room_beat"),
		at: timestamp,
		agentId,
		status: env.RoomState.text(input.status || "active"),
		currentMissionId: env.RoomState.text(input.currentMissionId || input.subMissionId),
		note: env.RoomState.text(input.note || input.message)
	};
}

/**
 * Mirrors heartbeat evidence into central metadata when that boundary is enabled.
 * @param {object} env Mission-room dependency vessel.
 * @param {object} input Heartbeat action payload.
 * @param {object} mission Mission whose room owns the heartbeat.
 * @param {object} beat Exact heartbeat receipt.
 * @returns {object|null} Metadata receipt when enabled, otherwise null.
 */
function recordMetadata(env, input, mission, beat) {
	if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
	return env.MetadataStore.record({
		root: input.__configRoot || input.projectRoot,
		metadataRoot: input.__metadataRoot
	}, mission, "room_heartbeat", {
		agentId: beat.agentId,
		message: beat.note,
		payload: {
			heartbeatId: beat.id,
			status: beat.status
		}
	});
}

module.exports = {
	buildBeat,
	heartbeat,
	recordMetadata
};
