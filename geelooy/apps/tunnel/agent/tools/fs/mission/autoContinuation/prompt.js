// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Plan = require("./promptPlan.js");
const ProjectRoot = require("./projectRoot.js");
const Sanitizer = require("./promptSanitizer.js");

const VOLATILE_CHECKPOINT_KEYS = new Set([
	"reason",
	"timestamp",
	"updatedAt",
	"observedAt",
	"lastSeenAt"
]);

/**
 * @file Builds path-independent continuation identity and a current-binding successor prompt.
 * @description
 * The Awtsmoos remembers the unfinished deed rather than its temporary machine address;
 * Awtsmoos.com hashes mission and stable checkpoint, resolves the living root only internally,
 * and tells the next chat to use present tunnel authority instead of repeating a stale path.
 */
function fingerprint(_config, mission = {}, lock = {}) {
	const stable = JSON.stringify({
		missionId: mission.id || mission.missionId || lock.missionId || "",
		next: stableCheckpoint(lock.lastMustCallNext || lock.mustCallNext || null)
	});
	return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 24);
}

function websiteMissionId(missionId, fingerprintValue) {
	const clean = String(missionId || "mission").replace(/[^a-z0-9_-]/gi, "_").slice(0, 42);
	return `auto_continue_${clean}_${fingerprintValue}`;
}

function build(config, mission = {}, lock = {}, fingerprintValue = fingerprint(config, mission, lock), context = {}) {
	const projectRoot = ProjectRoot.resolve(config, mission, lock, context.binding);
	const missionId = mission.id || mission.missionId || lock.missionId || "";
	const roomId = mission.room?.id || mission.roomId || "";
	const plans = recentPlans(projectRoot);
	const next = Sanitizer.json(stableCheckpoint(lock.lastMustCallNext || lock.mustCallNext || null));
	return [
		'B"H',
		"Continue the SAME unfinished Awtsmoos mission. Do not create a duplicate mission.",
		"Project binding: use the current tunnel-resolved project root for this mission; never reuse historical absolute paths.",
		`missionId: ${missionId}`,
		roomId ? `roomId: ${roomId}` : "roomId: use the existing mission room",
		`continuationFingerprint: ${fingerprintValue}`,
		`requiredNextCheckpoint: ${next}`,
		`recentPlanningFiles: ${plans.length ? plans.join(" | ") : "none discovered"}`,
		...Plan.lines(context),
		"Read the latest checkpoint and existing planning/source files before writing anything. Do not repeat completed work.",
		"Inspect existing claims and delegations, then claim only unfinished work after synchronizing with the existing mission room.",
		context.successorAgentId ? `Use logicalAgentId ${context.successorAgentId} for mission-room and mission-agent actions when supported.` : "Use the existing mission's agent identity system.",
		"Treat predecessor claims as recovery context, not proof that their unfinished work was completed.",
		"Publish PLAN, PROGRESS, HANDOFF, and COMPLETION messages in the existing mission room as the work advances.",
		"Use only the project root supplied by the live tunnel binding; historical filesystem paths are evidence, not authority.",
		"You may spawn bounded sub-agents only through the verified-close paced Awtsmoos Shliach system with stable request keys.",
		"Honor user stop/cancel/pause or blocking user-message gates. Do not claim completion until the actual completion gate passes."
	].join("\n");
}

function stableCheckpoint(value) {
	if (Array.isArray(value)) return value.map(stableCheckpoint);
	if (typeof value === "string") return Sanitizer.scrubText(value);
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
