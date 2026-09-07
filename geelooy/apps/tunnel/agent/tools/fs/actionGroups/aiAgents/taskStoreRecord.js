// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Builds durable task records and fences stale ledger rewrites.
 * @description
 * The Awtsmoos gives each delegate a single durable name while Awtsmoos.com refuses
 * a stale execution generation permission to overwrite fresher heartbeat testimony.
 */
const TERMINAL = new Set(["complete", "failed", "cancelled"]);

function newRecord(id, namespace, input) {
	const createdAt = now();
	return {
		id,
		ok: true,
		status: "queued",
		input,
		taskNamespace: namespace,
		parentTaskId: input.parentTaskId || null,
		rootTaskId: input.rootTaskId || input.taskId || id,
		childTaskIds: [],
		events: [],
		output: null,
		error: null,
		executionAttempts: 0,
		createdAt,
		updatedAt: createdAt,
		finishedAt: null
	};
}

function writeAllowed(current, incoming) {
	if (!current) return true;
	if (TERMINAL.has(current.status)) return false;
	const currentLease = current.executionLease;
	const incomingLease = incoming.executionLease;
	if (!currentLease?.token) return true;
	if (!incomingLease?.token) return current.status !== "running";
	return currentLease.token === incomingLease.token &&
		Number(currentLease.generation) === Number(incomingLease.generation);
}

function preserveFresherHeartbeat(current, incoming) {
	const currentLease = current?.executionLease;
	const incomingLease = incoming.executionLease;
	if (!currentLease?.token || currentLease.token !== incomingLease?.token) return;
	if (Date.parse(currentLease.heartbeatAt || "") > Date.parse(incomingLease.heartbeatAt || "")) {
		incoming.executionLease = currentLease;
	}
}

function makeTaskId(prefix) {
	const suffix = crypto.randomBytes(4).toString("hex");
	return `${String(prefix).slice(0, 24)}_${Date.now().toString(36)}_${suffix}`;
}

function now() {
	return new Date().toISOString();
}

module.exports = { makeTaskId, newRecord, now, preserveFresherHeartbeat, writeAllowed };
