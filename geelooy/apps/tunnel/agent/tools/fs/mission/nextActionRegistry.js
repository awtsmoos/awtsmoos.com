// B"H
// Boruch Hashem
// Blessed is He

const Record = require("./workRecord.js");
const Progress = require("./progressRegistry.js");

/**
 * @file Preserves NEXT_ACTION so mission momentum survives agent and session loss.
 * @description
 * The Awtsmoos creates the next instant before the previous vessel disappears from sight;
 * Awtsmoos.com stores the coming deed so a replacement Shliach can continue it right.
 */
function ensure(mission) {
	mission.nextActions ||= [];
	Progress.ensure(mission);
	return mission.nextActions;
}

/** Sets one durable next action while superseding only other active actions for its owner. */
function set(mission, projectRoot, input = {}) {
	const items = ensure(mission);
	const id = Record.stableId("next", mission.id, input);
	const index = items.findIndex(item => item.id === id);
	const owner = input.logicalAgentId || (index >= 0 ? items[index].logicalAgentId : "");
	for (const item of items) {
		if (item.id !== id && item.state === "active" && item.logicalAgentId === owner) {
			item.state = "superseded";
			item.updatedAt = new Date().toISOString();
		}
	}
	const existing = index >= 0 ? items[index] : {};
	const item = Record.nextAction(mission.id, projectRoot, {
		...input,
		id,
		state: input.state || "active"
	}, existing);
	if (index >= 0) {
		items[index] = item;
	} else {
		items.push(item);
	}
	Progress.register(mission, projectRoot, {
		...input,
		type: "next_action_set",
		workIds: input.workIds || []
	});
	return { ok: true, replayed: index >= 0, item };
}

/** Marks an existing next action complete while retaining it for takeover history. */
function complete(mission, projectRoot, input = {}) {
	const items = ensure(mission);
	const index = items.findIndex(item => item.id === input.id);
	if (index < 0) {
		return { ok: false, reason: "next_action_not_found", id: input.id || "" };
	}
	const now = new Date().toISOString();
	const item = Record.nextAction(mission.id, projectRoot, {
		...input,
		state: "completed",
		completedAt: input.completedAt || now
	}, items[index]);
	items[index] = item;
	Progress.register(mission, projectRoot, {
		...input,
		type: "next_action_completed"
	});
	return { ok: true, item };
}

function active(mission) {
	return (mission.nextActions || []).filter(item => item.state === "active");
}

module.exports = { active, complete, ensure, set };
