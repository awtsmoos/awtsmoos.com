// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const HandoffPaths = require("./handoffPaths.js");
const Plan = require("./promptPlan.js");
const ProjectRoot = require("./projectRoot.js");

const VOLATILE_CHECKPOINT_KEYS = new Set([
	"reason",
	"timestamp",
	"updatedAt",
	"observedAt",
	"lastSeenAt"
]);

/**
 * @file Builds one stable continuation identity and one absolute-path successor prompt.
 * @description
 * The Awtsmoos remembers the deed rather than scheduler shadows. Awtsmoos.com carries
 * one root, one predecessor, one generation, and exact handoff vessels so the next
 * Awts Shliach resumes the same mission instead of searching broadly or birthing a duplicate world.
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

function build(config, mission = {}, lock = {}, fingerprintValue = fingerprint(config, mission, lock), context = {}) {
	const projectRoot = ProjectRoot.resolve(config, mission, lock);
	const missionId = mission.id || mission.missionId || lock.missionId || "";
	const roomId = mission.room?.id || mission.roomId || "";
	const plans = context.handoffPaths?.length
		? context.handoffPaths
		: HandoffPaths.collect(config, mission, { ...context, projectRoot });
	const next = JSON.stringify(lock.lastMustCallNext || lock.mustCallNext || null);
	return [
		'B"H',
		"Continue the SAME unfinished Awtsmoos mission through the Awtsmoos Shliach custom GPT. Do not create a duplicate mission.",
		`Absolute projectRoot: ${projectRoot}`,
		`missionId: ${missionId}`,
		roomId ? `roomId: ${roomId}` : "roomId: use the existing mission room",
		`continuationFingerprint: ${fingerprintValue}`,
		`requiredNextCheckpoint: ${next}`,
		`absoluteHandoffAndThoughtFiles: ${plans.length ? plans.join(" | ") : "none discovered"}`,
		...Plan.lines({ ...context, handoffPaths: plans }),
		"BEFORE modifying anything, read every listed handoff/thought file that still exists, then inspect current Git/filesystem reality because predecessor notes may be stale.",
		"Do not recursively scan AI-thought history when exact paths were supplied. Do not repeat completed work.",
		"Inspect existing claims and delegations, then claim only unfinished work after synchronizing with the existing mission room.",
		context.successorAgentId ? `Use logicalAgentId ${context.successorAgentId} for mission-room and mission-agent actions when supported.` : "Use the existing mission's agent identity system.",
		context.spawnGroupId ? `Rejoin sibling spawnGroupId ${context.spawnGroupId}; use group-addressed room messages for sibling-only coordination.` : "Join the existing mission room before working.",
		`Your successor generation is ${Number(context.successorGeneration || 2)}; predecessor is ${context.predecessorAgentId || "unknown"}.`,
		"Treat predecessor claims as recovery context, not proof that unfinished work was completed. Revalidate before taking ownership.",
		"Publish PLAN, PROGRESS, HANDOFF, and COMPLETION messages in the existing mission room as work advances.",
		"Never change project root, physical device identity, tunnel identity, or browser ownership without explicit necessity.",
		"You may spawn bounded sub-agents only through the existing verified-close paced Awtsmoos Shliach system with stable request keys.",
		"Honor user stop/cancel/pause or blocking user-message gates immediately. Do not claim mission completion until the actual completion gate passes."
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
	return HandoffPaths.collect(
		{ root: process.env.AWTSMOOS_PROJECT_ROOT || projectRoot },
		{ projectRoot },
		{ projectRoot }
	);
}

module.exports = { build, fingerprint, recentPlans, stableCheckpoint, websiteMissionId };
