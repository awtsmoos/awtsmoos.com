// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (4) Swarm missions.
 * One mission auto-splits into shard missions for parallel agents,
 * then merges: children complete, the parent collects their results
 * into one summary and becomes ready to complete.
 */

const Store = require("./store.js");
const Model = require("./model.js");
const Service = require("./service.js");

async function split(config, payload = {}) {
	const parent = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!parent) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || parent.assignee || parent.createdBy;
	const denied = Model.authorize(parent, actor, "mutate");
	if (denied) {
		const error = new Error(`Actor ${actor} may not swarm-split mission ${parent.missionId}.`);
		error.code = denied;
		throw error;
	}
	const shards = Array.isArray(payload.shards) ? payload.shards : [];
	if (!shards.length) {
		const error = new Error("Swarm split needs shards[].");
		error.code = "shards_required";
		throw error;
	}
	if (shards.length > 25) {
		const error = new Error("Swarm split caps at 25 shards.");
		error.code = "too_many_shards";
		throw error;
	}
	const children = [];
	for (let i = 0; i < shards.length; i++) {
		const shard = shards[i] || {};
		const child = await Service.create(config, {
			actor,
			projectRoot: parent.projectRoot,
			title: `${parent.title} — shard ${i + 1}/${shards.length}: ${shard.title || shard.name || `part ${i + 1}`}`,
			goal: [parent.goal, shard.goal || shard.brief || ""].filter(Boolean).join("\n\nShard brief: "),
			tags: [...new Set([...(parent.tags || []), "swarm-shard", ...(shard.tags || [])])],
			skillsRequired: shard.skillsRequired || parent.skillsRequired,
			swarmParentId: parent.missionId,
			swarmRole: "shard",
			spawnedFrom: parent.missionId
		});
		parent.swarm.children.push(child.missionId);
		children.push(child);
	}
	parent.swarm.role = "swarm-parent";
	parent.notes.push(Model.note({ by: actor, text: `Swarm-split into ${children.length} shards for parallel agents.` }));
	await Store.saveMission(config, parent);
	await Store.activity(config, { kind: "swarm_split", missionId: parent.missionId, shards: children.length, by: actor });
	return { parent, children };
}

async function childrenOf(config, missionId, projectRoot = null) {
	const parent = await Store.loadMission(config, missionId, projectRoot);
	if (!parent) {
		const error = new Error(`No mission ${missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const children = [];
	for (const childId of parent.swarm.children || []) {
		const child = await Store.loadMission(config, childId, parent.projectRoot);
		if (child) children.push(child);
	}
	return { parent, children };
}

/**
 * Merge: every shard must be complete or failed; collect their summaries
 * into the parent and mark the parent ready (status stays active/claimed —
 * the holder completes it normally, or auto-complete when asked).
 */
async function merge(config, payload = {}) {
	const { parent, children } = await childrenOf(config, payload.missionId, payload.projectRoot);
	if (!children.length) {
		const error = new Error("Nothing to merge — no shards.");
		error.code = "no_shards";
		throw error;
	}
	const actor = payload.actor || parent.assignee || parent.createdBy;
	const denied = Model.authorize(parent, actor, "mutate");
	if (denied) {
		const error = new Error(`Actor ${actor} may not swarm-merge mission ${parent.missionId}.`);
		error.code = denied;
		throw error;
	}
	const pending = children.filter(c => c.status !== "complete" && c.status !== "failed");
	if (pending.length && payload.strict !== false) {
		const error = new Error(`${pending.length} shard(s) still pending: ${pending.map(c => c.missionId).join(", ")}`);
		error.code = "shards_pending";
		error.pending = pending.map(c => c.missionId);
		throw error;
	}
	const digest = children.map(c => `— ${c.title} [${c.status}]: ${c.progress.summary || c.notes.slice(-1)[0]?.text || "(no summary)"}`).join("\n");
	parent.notes.push(Model.note({ by: actor, text: `Swarm merged ${children.length} shards:\n${digest}` }));
	parent.progress = { percent: parent.progress.percent, summary: `Swarm merged ${children.length}/${children.length} shards.`, updatedAt: Model.stamp() };
	await Store.saveMission(config, parent);
	await Store.activity(config, { kind: "swarm_merged", missionId: parent.missionId, shards: children.length, by: actor });
	return { parent, children, digest };
}

module.exports = { split, merge, childrenOf };
