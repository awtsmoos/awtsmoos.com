// B"H
// Boruch Hashem
// Blessed is He

const Record = require("./workRecord.js");
const Progress = require("./progressRegistry.js");

const CLOSED_STATES = new Set(["completed", "verified", "abandoned"]);

/**
 * @file Governs first-class REMAINING_WORK inside durable mission state.
 * @description
 * The Awtsmoos draws unfinished sparks toward completion without erasing where they came;
 * Awtsmoos.com guards verification, ownership, and discovery through one enduring name.
 */
function ensure(mission) {
	mission.remainingWork ||= [];
	Progress.ensure(mission);
	return mission.remainingWork;
}

/** Registers or idempotently refreshes a durable work item. */
function register(mission, projectRoot, input = {}) {
	const items = ensure(mission);
	const id = Record.stableId("work", mission.id, input);
	const index = items.findIndex(item => item.id === id);
	const existing = index >= 0 ? items[index] : {};
	const item = Record.work(mission.id, projectRoot, { ...input, id }, existing);
	if (index >= 0) {
		items[index] = item;
	} else {
		items.push(item);
	}
	Progress.register(mission, projectRoot, {
		...input,
		type: input.progressType || "work_registered",
		workId: id
	});
	return { ok: true, replayed: index >= 0, item };
}

/** Updates known work without silently inventing a different durable identity. */
function update(mission, projectRoot, input = {}) {
	const items = ensure(mission);
	const index = items.findIndex(item => item.id === input.id);
	if (index < 0) {
		return { ok: false, reason: "work_not_found", id: input.id || "" };
	}
	const item = Record.work(mission.id, projectRoot, input, items[index]);
	items[index] = item;
	Progress.register(mission, projectRoot, {
		...input,
		type: input.progressType || "work_updated",
		workId: item.id
	});
	return { ok: true, item };
}

/** Closes work only when its declared verification covenant is satisfied. */
function complete(mission, projectRoot, input = {}) {
	const current = ensure(mission).find(item => item.id === input.id);
	if (!current) {
		return { ok: false, reason: "work_not_found", id: input.id || "" };
	}
	const nextVerification = Record.verification(input, current.verification);
	if (nextVerification.required && nextVerification.status !== "passed") {
		return { ok: false, reason: "verification_required", item: current };
	}
	return update(mission, projectRoot, {
		...input,
		state: nextVerification.required ? "verified" : "completed",
		verification: nextVerification,
		progressType: "work_completed"
	});
}

function open(mission) {
	return (mission.remainingWork || []).filter(item => !CLOSED_STATES.has(item.state));
}

module.exports = { CLOSED_STATES, complete, ensure, open, register, update };
