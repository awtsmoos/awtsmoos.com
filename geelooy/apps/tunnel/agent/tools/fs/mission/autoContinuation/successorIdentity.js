// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Derives deterministic Mission Room successor and spawn-group identity.
 * @description
 * The Awtsmoos lets one unfinished task pass through generations without multiplying.
 * Awtsmoos.com hashes mission, room, predecessor, task, and checkpoint into one spawn
 * group so repeated recovery witnesses converge on the same successor admission key.
 */
function build(mission = {}, predecessor = {}, taskLease = {}, fingerprint = "") {
	const missionId = mission.id || mission.missionId;
	const roomId = String(mission.room?.id || mission.roomId || missionId || "room");
	const predecessorGeneration = positive(
		predecessor.generation || taskLease.generation,
		1
	);
	const successorGeneration = predecessorGeneration + 1;
	const spawnGroupId = spawnGroup(
		missionId,
		roomId,
		predecessor.agentId,
		taskLease.taskId,
		fingerprint
	);
	const successorAgentId = successorId(missionId, predecessor.agentId, fingerprint);
	return {
		roomId,
		predecessorGeneration,
		successorGeneration,
		spawnGroupId,
		successorAgentId,
		successorAgentSessionId: `session_${hash(`${spawnGroupId}:${successorGeneration}`).slice(0, 12)}`
	};
}

function successorId(missionId, predecessorId, fingerprint) {
	const mission = clean(missionId, 24);
	const predecessor = clean(predecessorId || "unassigned", 20);
	const checkpoint = clean(fingerprint || "checkpoint", 18);
	return `successor_${mission}_${predecessor}_${checkpoint}`.slice(0, 80);
}

function spawnGroup(missionId, roomId, predecessorId, taskId, fingerprint) {
	const raw = [missionId, roomId, predecessorId, taskId, fingerprint].join(":");
	return `spawn_${hash(raw).slice(0, 20)}`;
}

function hash(value) {
	return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function clean(value, limit) {
	return String(value || "")
		.replace(/[^a-z0-9_-]+/gi, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, limit) || "unknown";
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = { build, spawnGroup, successorId };
