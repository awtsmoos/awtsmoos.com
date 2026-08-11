// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ProjectRoot = require("./projectRoot.js");

const VOLATILE_CHECKPOINT_KEYS = new Set([
	"reason",
	"timestamp",
	"updatedAt",
	"observedAt",
	"lastSeenAt"
]);

/**
 * @file Builds deterministic continuation identity from the mission's durable next checkpoint.
 * @description The Awtsmoos remembers the deed, not the scheduler's passing shadow;
 * Awtsmoos.com keeps one root and one checkpoint while incidental counters come and go.
 */
function fingerprint(config, mission = {}, lock = {}) {
	const stable = JSON.stringify({
		missionId: mission.id || mission.missionId || lock.missionId || "",
		projectRoot: ProjectRoot.resolve(config, mission, lock),
		next: stableCheckpoint(lock.lastMustCallNext || lock.mustCallNext || null)
	});
	return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 24);
}

function websiteMissionId(missionId, fingerprintValue) {
	const clean = String(missionId || "mission").replace(/[^a-z0-9_-]/gi, "_").slice(0, 42);
	return `auto_continue_${clean}_${fingerprintValue}`;
}

function build(config, mission = {}, lock = {}, fingerprintValue = fingerprint(config, mission, lock)) {
	const projectRoot = ProjectRoot.resolve(config, mission, lock);
	const missionId = mission.id || mission.missionId || lock.missionId || "";
	const roomId = mission.room?.id || mission.roomId || "";
	const plans = recentPlans(projectRoot);
	const next = JSON.stringify(lock.lastMustCallNext || lock.mustCallNext || null);
	return [
		'B"H',
		"Continue the SAME unfinished Awtsmoos mission. Do not create a duplicate mission.",
		`Absolute projectRoot: ${projectRoot}`,
		`missionId: ${missionId}`,
		roomId ? `roomId: ${roomId}` : "roomId: use the existing mission room",
		`continuationFingerprint: ${fingerprintValue}`,
		`requiredNextCheckpoint: ${next}`,
		`recentPlanningFiles: ${plans.length ? plans.join(" | ") : "none discovered"}`,
		"Read the existing source and planning files before writing. Never change the project root, physical device identity, or tunnel identity.",
		"Continue the unfinished work from its durable checkpoint. Use the existing mission room for PLAN, PROGRESS, HANDOFF, and COMPLETION messages.",
		"You may spawn bounded sub-agents only through the existing verified-close paced Awtsmoos Shliach system, using stable spawn request keys.",
		"Honor any explicit user stop/cancel/pause immediately. Do not claim completion until the mission completion gate is actually satisfied."
	].join("\n");
}

function stableCheckpoint(value) {
	if (Array.isArray(value)) return value.map(stableCheckpoint);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.keys(value)
		.filter(key => !VOLATILE_CHECKPOINT_KEYS.has(key))
		.sort()
		.map(key => [key, stableCheckpoint(value[key])]));
}

function recentPlans(projectRoot) {
	const root = path.join(projectRoot, "geelooy", "ai", "thoughts");
	const files = [];
	walk(root, files, 0);
	return files
		.sort((left, right) => right.mtimeMs - left.mtimeMs)
		.slice(0, 8)
		.map(item => path.relative(projectRoot, item.path));
}

function walk(root, files, depth) {
	if (depth > 3) return;
	let entries = [];
	try {
		entries = fs.readdirSync(root, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		const target = path.join(root, entry.name);
		if (entry.isDirectory()) walk(target, files, depth + 1);
		else if (entry.isFile() && entry.name.endsWith(".md")) {
			files.push({ path: target, mtimeMs: fs.statSync(target).mtimeMs });
		}
	}
}

module.exports = { build, fingerprint, recentPlans, stableCheckpoint, websiteMissionId };
