// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — Mission Board model.
 * A mission is the unit of work every Awtsmoos project can hand to an AI agent.
 * Statuses: open -> claimed -> active -> paused -> active ... -> complete | failed
 */

const crypto = require("node:crypto");

const STATUSES = ["open", "claimed", "active", "paused", "complete", "failed"];

function stamp() { return new Date().toISOString(); }

function id(prefix) {
	return `${prefix}_${stamp().replace(/[-:.TZ]/g, "")}_${crypto.randomBytes(4).toString("hex")}`;
}

function cleanText(value, max = 5000) {
	return String(value == null ? "" : value).slice(0, max);
}

function cleanList(value) {
	if (!Array.isArray(value)) return [];
	return value.map(v => String(v).slice(0, 200)).filter(Boolean).slice(0, 50);
}

function createMission(payload = {}) {
	const now = stamp();
	return {
		missionId: payload.missionId || id("msn"),
		projectRoot: cleanText(payload.projectRoot || "general", 300),
		title: cleanText(payload.title || "Untitled mission", 300),
		goal: cleanText(payload.goal || ""),
		tags: cleanList(payload.tags),
		skillsRequired: cleanList(payload.skillsRequired || payload.skills),
		status: "open",
		createdBy: cleanText(payload.createdBy || payload.actor || "unknown", 200),
		assignee: null,
		createdAt: now,
		updatedAt: now,
		templateId: payload.templateId || null,
		spawnedFrom: payload.spawnedFrom || null,
		leases: [],
		checkpoints: [],
		evidence: [],
		notes: [],
		messages: [],
		capsules: [],
		progress: { percent: 0, summary: "", updatedAt: now },
		chain: { followups: [] },
		swarm: { parentId: payload.swarmParentId || null, children: [], role: payload.swarmRole || null },
		autopsy: null,
		completedAt: null
	};
}

function touch(mission) {
	mission.updatedAt = stamp();
	return mission;
}

function lease(payload = {}) {
	const now = stamp();
	return {
		leaseId: payload.leaseId || id("lease"),
		agentLabel: cleanText(payload.agentLabel || payload.actor || "agent", 200),
		focus: cleanText(payload.focus || ""),
		claimedAt: now,
		lastHeartbeatAt: now
	};
}

function checkpoint(payload = {}) {
	return {
		checkpointId: payload.checkpointId || id("chk"),
		plainEnglish: cleanText(payload.plainEnglish || ""),
		status: payload.status || "open",
		evidenceIds: [],
		required: payload.required !== false,
		createdAt: stamp()
	};
}

function note(payload = {}) {
	return { at: stamp(), by: cleanText(payload.by || payload.actor || "agent", 200), text: cleanText(payload.text || "") };
}

function message(payload = {}) {
	return {
		messageId: payload.messageId || id("msg"),
		at: stamp(),
		from: cleanText(payload.from || payload.actor || "agent", 200),
		to: payload.to ? cleanText(payload.to, 200) : null,
		text: cleanText(payload.text || "")
	};
}

function capsuleRecord(mission, payload = {}) {
	return {
		capsuleId: payload.capsuleId || id("cap"),
		missionId: mission.missionId,
		createdAt: stamp(),
		by: cleanText(payload.by || payload.actor || "agent", 200),
		label: cleanText(payload.label || "checkpoint", 200),
		snapshot: JSON.parse(JSON.stringify(mission)),
		resumeBrief: buildResumeBrief(mission)
	};
}

function buildResumeBrief(mission) {
	const done = mission.checkpoints.filter(c => c.status === "complete").length;
	return [
		`Mission: ${mission.title} [${mission.missionId}] — status ${mission.status}, ${mission.progress.percent}% — ${mission.progress.summary || "no summary yet"}.`,
		`Goal: ${mission.goal || "(no goal recorded)"}`,
		`Checkpoints: ${done}/${mission.checkpoints.length} complete.`,
		mission.notes.length ? `Latest note (${mission.notes[mission.notes.length - 1].by}): ${mission.notes[mission.notes.length - 1].text}` : "No notes yet.",
		mission.autopsy ? `AUTOPSY ON RECORD: ${mission.autopsy.lesson}` : ""
	].filter(Boolean).join("\n");
}

/** Permission scope: who may do what. Returns null when allowed, else an error code. */
function authorize(mission, actor, op) {
	const who = cleanText(actor || "", 200);
	if (!who) return "actor_required";
	if (op === "read") return null;
	if (op === "claim") {
		if (mission.status !== "open") return "mission_not_open";
		return null;
	}
	if (op === "assign") {
		if (!mission.assignee) return null; // open missions can be assigned by anyone
		if (who === mission.assignee || who === mission.createdBy) return null;
		return "not_assignee_or_creator";
	}
	// mutate-class ops: progress, note, checkpoint, message, pause, resume, complete, fail, chain, swarm
	if (who === mission.assignee || who === mission.createdBy) return null;
	return "not_assignee_or_creator";
}

module.exports = {
	STATUSES, stamp, id, cleanText, cleanList,
	createMission, touch, lease, checkpoint, note, message,
	capsuleRecord, buildResumeBrief, authorize
};
