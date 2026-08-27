// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Plan = require("./promptPlan.js");
const Sanitizer = require("./promptSanitizer.js");
const TrustedPaths = require("./trustedPathContext.js");

const VOLATILE_CHECKPOINT_KEYS = new Set([
	"reason",
	"timestamp",
	"updatedAt",
	"observedAt",
	"lastSeenAt"
]);

/**
 * @file Builds one stable mission identity and one fresh-chat prompt with verified live paths.
 * @description
 * The Awtsmoos remembers unfinished meaning while Awtsmoos.com distinguishes current authority
 * from historical coordinates: verified roots and files remain explicit, old paths inside
 * arbitrary evidence stay redacted, and the next shliach receives both map and mission.
 */
function fingerprint(_config, mission = {}, lock = {}) {
	const stable = JSON.stringify({
		missionId: mission.id || mission.missionId || lock.missionId || "",
		next: stableCheckpoint(lock.lastMustCallNext || lock.mustCallNext || null)
	});
	return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 24);
}

function websiteMissionId(missionId, fingerprintValue) {
	const clean = String(missionId || "mission")
		.replace(/[^a-z0-9_-]/gi, "_")
		.slice(0, 42);
	return `auto_continue_${clean}_${fingerprintValue}`;
}

function build(
	config,
	mission = {},
	lock = {},
	fingerprintValue = fingerprint(config, mission, lock),
	context = {}
) {
	const paths = TrustedPaths.build(config, mission, lock, context);
	const missionId = mission.id || mission.missionId || lock.missionId || "";
	const roomId = mission.room?.id || mission.roomId || "";
	const next = Sanitizer.json(stableCheckpoint(
		lock.lastMustCallNext || lock.mustCallNext || null
	));
	return [
		'B"H',
		"This is a FRESH browser chat continuing the SAME unfinished Awtsmoos mission. Do not create a duplicate mission.",
		...TrustedPaths.promptLines(paths),
		`missionId: ${missionId}`,
		roomId ? `roomId: ${roomId}` : "roomId: use the existing mission room",
		`continuationFingerprint: ${fingerprintValue}`,
		`requiredNextCheckpoint: ${next}`,
		...Plan.lines({ ...context, handoffPaths: paths.handoffReferences }),
		"Before modifying anything, inspect current Git/filesystem reality and read each verified handoff path above.",
		"Historical paths in predecessor notes are evidence, not authority. Do not repeat completed work.",
		"Synchronize with the existing mission room, claims, and delegations before taking unfinished work.",
		context.successorAgentId
			? `Use logicalAgentId ${context.successorAgentId} for mission-room and mission-agent actions when supported.`
			: "Use the existing mission's agent identity system.",
		context.spawnGroupId
			? `Rejoin sibling spawnGroupId ${context.spawnGroupId} for sibling-only coordination.`
			: "Join the existing mission room before working.",
		`Your successor generation is ${Number(context.successorGeneration || 2)}; predecessor is ${context.predecessorAgentId || "unknown"}.`,
		"Publish PLAN, PROGRESS, HANDOFF, and COMPLETION messages in the existing mission room as work advances.",
		"You may spawn sub-agents only through the verified-close paced Awtsmoos Shliach system with stable request keys.",
		"Honor user stop/cancel/pause and blocking user-message gates. Claim completion only when the actual completion gate passes."
	].join(String.fromCharCode(10));
}

function stableCheckpoint(value) {
	if (Array.isArray(value)) return value.map(stableCheckpoint);
	if (typeof value === "string") return Sanitizer.scrubText(value);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(
		Object.keys(value)
			.filter((key) => !VOLATILE_CHECKPOINT_KEYS.has(key))
			.sort()
			.map((key) => [key, stableCheckpoint(value[key])])
	);
}

module.exports = {
	build,
	fingerprint,
	stableCheckpoint,
	websiteMissionId
};
