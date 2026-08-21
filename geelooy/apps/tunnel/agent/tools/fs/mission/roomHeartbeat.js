// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("./roomRuntime.js");

/**
 * @file Renews live room agents while refusing heartbeats from superseded generations.
 * @description
 * The Awtsmoos recreates every instant, yet Awtsmoos.com must not let yesterday's
 * messenger reclaim a task after succession. A fenced predecessor may still be seen
 * in history, but its late pulse cannot turn superseded custody back into active ownership.
 */
function heartbeat(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const existing = room.agents[agentId];
	if (existing?.status === "superseded") {
		return fencedBeat(existing, input, env, agentId);
	}
	const timestamp = env.RoomState.now();
	const beat = buildBeat(input, env, agentId, timestamp);
	room.heartbeats.push(beat);
	room.heartbeats = room.heartbeats.slice(-1000);
	if (input.currentWork || input.currentAction) {
		room.currentWork = env.RoomState.text(input.currentWork || input.currentAction);
	}
	if (existing) {
		existing.lastSeenAt = timestamp;
		existing.status = beat.status;
		existing.generation = Math.max(
			Number(existing.generation || 1),
			positive(input.generation, Number(existing.generation || 1))
		);
	}
	Runtime.renewHeartbeat(room, input, agentId, timestamp);
	recordMetadata(env, input, mission, beat);
	return beat;
}

function fencedBeat(existing, input, env, agentId) {
	return {
		id: env.RoomState.id("room_beat_rejected"),
		at: env.RoomState.now(),
		agentId,
		status: "superseded",
		accepted: false,
		reason: "superseded_generation_fenced",
		generation: positive(input.generation, Number(existing.generation || 1)),
		supersededByAgentId: existing.supersededByAgentId || null,
		supersededByGeneration: existing.supersededByGeneration || null
	};
}

/**
 * Builds one accepted heartbeat receipt for room history and runtime liveness.
 *
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
		generation: positive(input.generation, 1),
		currentMissionId: env.RoomState.text(input.currentMissionId || input.subMissionId),
		note: env.RoomState.text(input.note || input.message),
		accepted: true
	};
}

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
			status: beat.status,
			generation: beat.generation
		}
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	buildBeat,
	fencedBeat,
	heartbeat,
	recordMetadata
};
