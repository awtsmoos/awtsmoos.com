// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (8) Mission chaining.
 * A mission can declare follow-ups; when it completes, the follow-ups
 * auto-spawn as new tracked missions linked back to their parent.
 */

const Store = require("./store.js");
const Model = require("./model.js");
const Templates = require("./templates.js");
const Service = require("./service.js");

async function add(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || mission.createdBy || "unknown";
	const denied = Model.authorize(mission, actor, "mutate");
	if (denied) {
		const error = new Error(`Actor ${actor} may not chain mission ${mission.missionId}.`);
		error.code = denied;
		throw error;
	}
	const followups = Array.isArray(payload.followups) ? payload.followups : [];
	if (!followups.length) {
		const error = new Error("Chain needs followups[].");
		error.code = "followups_required";
		throw error;
	}
	for (const f of followups) {
		mission.chain.followups.push({
			templateId: f.templateId || null,
			title: Model.cleanText(f.title || f.templateId || "follow-up", 300),
			goal: Model.cleanText(f.goal || ""),
			params: f.params || {},
			status: "pending",
			addedBy: Model.cleanText(actor, 200),
			addedAt: Model.stamp(),
			spawnedMissionId: null
		});
	}
	mission.notes.push(Model.note({ by: actor, text: `Chained ${followups.length} follow-up(s) to fire on completion.` }));
	await Store.saveMission(config, mission);
	return mission;
}

/** Fire pending follow-ups when a mission completes. Called by lifecycle.complete. */
async function fire(config, mission, actor) {
	const pending = (mission.chain.followups || []).filter(f => f.status === "pending");
	const spawned = [];
	for (const f of pending) {
		let blueprint;
		if (f.templateId) {
			try {
				blueprint = await Templates.instantiate(config, f.templateId, { ...(f.params || {}), parentTitle: mission.title });
			} catch { blueprint = null; }
		}
		const child = await Service.create(config, {
			actor: actor || mission.assignee || "chainer",
			projectRoot: mission.projectRoot,
			title: blueprint ? blueprint.title : f.title,
			goal: [blueprint ? blueprint.goal : f.goal, `Chained from completed mission: ${mission.title} [${mission.missionId}]`].filter(Boolean).join("\n\n"),
			tags: [...new Set([...(mission.tags || []), "chained"])],
			skillsRequired: blueprint ? blueprint.skillsRequired : [],
			templateId: f.templateId,
			spawnedFrom: mission.missionId
		});
		if (blueprint && blueprint.checkpoints) {
			for (const c of blueprint.checkpoints) child.checkpoints.push(Model.checkpoint(c));
			await Store.saveMission(config, child);
		}
		f.status = "spawned";
		f.spawnedMissionId = child.missionId;
		spawned.push(child);
		await Store.activity(config, { kind: "chain_spawned", from: mission.missionId, missionId: child.missionId, by: actor });
	}
	if (spawned.length) {
		mission.notes.push(Model.note({ by: actor || "chainer", text: `Completion spawned ${spawned.length} follow-up mission(s).` }));
		await Store.saveMission(config, mission);
	}
	return spawned;
}

module.exports = { add, fire };
