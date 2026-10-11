// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — Mission Board core service.
 * Per-project boards + the cross-project marketplace.
 * Every mutation records its actor; authorize() in model.js scopes permissions.
 */

const Store = require("./store.js");
const Model = require("./model.js");
const Autopsy = require("./autopsy.js");

function err(code, detail) {
	const error = new Error(detail || code);
	error.code = code;
	return error;
}

async function withMission(config, missionId, actor, op, fn, projectRoot = null) {
	const mission = await Store.loadMission(config, missionId, projectRoot);
	if (!mission) throw err("mission_not_found", `No mission ${missionId}.`);
	const denied = Model.authorize(mission, actor, op);
	if (denied) throw err(denied, `Actor ${actor || "?"} may not ${op} mission ${missionId} (${denied}).`);
	const result = fn(mission);
	await Store.saveMission(config, mission);
	return { mission, result };
}

async function create(config, payload = {}) {
	const actor = payload.actor || payload.createdBy || "unknown";
	const mission = Model.createMission({ ...payload, createdBy: actor });
	// Attach lessons from past failures so history is never repeated.
	try {
		mission.priorLessons = await Autopsy.lessons(config, { projectRoot: mission.projectRoot, tags: mission.tags, limit: 3 });
	} catch { mission.priorLessons = []; }
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "mission_created", missionId: mission.missionId, projectRoot: mission.projectRoot, title: mission.title, by: actor });
	return mission;
}

/** Per-project board. */
async function board(config, projectRoot) {
	return Store.listMissions(config, projectRoot || "general");
}

/** (1) Mission marketplace — open missions across every project. */
async function marketplace(config, filter = {}) {
	return Store.listAllMissions(config, { status: "open", ...filter });
}

async function get(config, missionId, projectRoot = null) {
	const mission = await Store.loadMission(config, missionId, projectRoot);
	if (!mission) throw err("mission_not_found", `No mission ${missionId}.`);
	return mission;
}

/** Claim = an agent assigns the mission to itself. */
async function claim(config, payload = {}) {
	const { mission, result } = await withMission(config, payload.missionId, payload.actor, "claim", m => {
		const l = Model.lease({ agentLabel: payload.agentLabel || payload.actor, focus: payload.focus });
		m.leases.push(l);
		m.assignee = l.agentLabel;
		m.status = "claimed";
		m.notes.push(Model.note({ by: l.agentLabel, text: `Claimed the mission${payload.focus ? ` — focus: ${payload.focus}` : ""}.` }));
		return l;
	}, payload.projectRoot);
	await Store.activity(config, { kind: "mission_claimed", missionId: mission.missionId, by: mission.assignee });
	return { mission, lease: result };
}

/** Assign = a project (or current holder) hands the mission to an agent. */
async function assign(config, payload = {}) {
	if (!payload.agentLabel) throw err("agent_required", "assign needs agentLabel.");
	const { mission } = await withMission(config, payload.missionId, payload.actor, "assign", m => {
		const previous = m.assignee;
		m.assignee = Model.cleanText(payload.agentLabel, 200);
		if (m.status === "open") m.status = "claimed";
		m.notes.push(Model.note({ by: payload.actor, text: `Assigned to ${m.assignee}${previous ? ` (was ${previous})` : ""}.` }));
		return m.assignee;
	}, payload.projectRoot);
	await Store.activity(config, { kind: "mission_assigned", missionId: mission.missionId, to: mission.assignee, by: payload.actor });
	return mission;
}

/** Release = hand the mission back to the open pool. */
async function release(config, payload = {}) {
	const { mission } = await withMission(config, payload.missionId, payload.actor, "assign", m => {
		const previous = m.assignee;
		m.assignee = null;
		m.status = "open";
		m.notes.push(Model.note({ by: payload.actor, text: `Released${previous ? ` (was held by ${previous})` : ""} — back in the open pool.` }));
		return previous;
	}, payload.projectRoot);
	await Store.activity(config, { kind: "mission_released", missionId: mission.missionId, by: payload.actor });
	return mission;
}

async function setProgress(config, payload = {}) {
	const { mission } = await withMission(config, payload.missionId, payload.actor, "mutate", m => {
		const pct = Math.max(0, Math.min(100, Number(payload.percent) || 0));
		m.progress = { percent: pct, summary: Model.cleanText(payload.summary || m.progress.summary), updatedAt: Model.stamp() };
		if (m.status === "claimed" && pct > 0) m.status = "active";
		return m.progress;
	}, payload.projectRoot);
	return mission;
}

async function addNote(config, payload = {}) {
	if (!payload.text) throw err("text_required", "note needs text.");
	const { mission } = await withMission(config, payload.missionId, payload.actor, "mutate", m => {
		m.notes.push(Model.note({ by: payload.actor, text: payload.text }));
		return m.notes[m.notes.length - 1];
	}, payload.projectRoot);
	return mission;
}

async function addCheckpoint(config, payload = {}) {
	if (!payload.plainEnglish) throw err("text_required", "checkpoint needs plainEnglish.");
	const { mission } = await withMission(config, payload.missionId, payload.actor, "mutate", m => {
		const c = Model.checkpoint(payload);
		m.checkpoints.push(c);
		return c;
	}, payload.projectRoot);
	return mission;
}

async function completeCheckpoint(config, payload = {}) {
	const { mission } = await withMission(config, payload.missionId, payload.actor, "mutate", m => {
		const c = m.checkpoints.find(x => x.checkpointId === payload.checkpointId);
		if (!c) throw err("checkpoint_not_found", `No checkpoint ${payload.checkpointId}.`);
		c.status = "complete";
		return c;
	}, payload.projectRoot);
	return mission;
}

/**
 * The resume bundle: everything an agent needs to pick a mission up on login
 * and continue exactly where the last agent left off.
 */
async function context(config, missionId, projectRoot = null) {
	const mission = await get(config, missionId, projectRoot);
	const openCheckpoints = mission.checkpoints.filter(c => c.status !== "complete");
	return {
		missionId: mission.missionId,
		projectRoot: mission.projectRoot,
		title: mission.title,
		goal: mission.goal,
		status: mission.status,
		assignee: mission.assignee,
		createdBy: mission.createdBy,
		tags: mission.tags,
		skillsRequired: mission.skillsRequired,
		progress: mission.progress,
		resumeBrief: Model.buildResumeBrief(mission),
		checkpoints: mission.checkpoints,
		openCheckpoints,
		evidence: mission.evidence,
		recentNotes: mission.notes.slice(-20),
		recentMessages: mission.messages.slice(-20),
		capsules: mission.capsules.map(c => ({ capsuleId: c.capsuleId, createdAt: c.createdAt, by: c.by, label: c.label })),
		priorLessons: mission.priorLessons || [],
		autopsy: mission.autopsy,
		chain: mission.chain,
		swarm: mission.swarm,
		templateId: mission.templateId,
		spawnedFrom: mission.spawnedFrom,
		leases: mission.leases,
		updatedAt: mission.updatedAt
	};
}

module.exports = {
	create, board, marketplace, get, claim, assign, release,
	setProgress, addNote, addCheckpoint, completeCheckpoint, context,
	withMission
};
