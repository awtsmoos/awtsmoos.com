// B"H
// Boruch Hashem
// Blessed is He

const Agents = require("./plannerAgents.js");
const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");
const Target = require("./plannerTarget.js");

/**
 * @file Composes one congestion-safe Awts Shliach website mission with durable lineage.
 * @description
 * The Awtsmoos may call hundreds of logical peers while Awtsmoos.com opens only one
 * verified-close browser tab at a time. Ordinary missions keep flat peer identities;
 * takeover missions reuse the exact successor name, group, and generation they were given.
 */
function plan(config = {}, input = {}) {
	const projectRoot = Scopes.canonicalProjectRoot(input.projectRoot || config.root || process.cwd());
	const scale = Policy.promptScale(input);
	const count = Policy.agentCount(input, scale);
	const scopes = Scopes.scopeCandidates(projectRoot, input);
	const target = Target.customGptTarget(input);
	const startSpacingMs = Policy.spacing(input.startSpacingMs);
	const maxTotalWebsiteAgents = Policy.bounded(
		input.maxTotalWebsiteAgents,
		Math.max(256, count),
		count,
		512
	);
	const maxSubagentsPerAgent = Policy.bounded(
		input.maxSubagentsPerAgent ?? input.maxHelpersPerAgent,
		32,
		1,
		96
	);
	return {
		projectRoot,
		agentStartUrl: target.url,
		customGptName: target.name,
		requestedCount: input.agentCount ?? input.count ?? null,
		agentCount: count,
		minimumAgentCount: Policy.minimumAgentCount(input),
		continuationOnly: Policy.continuationOnly(input),
		continuationFingerprint: String(input.continuationFingerprint || ""),
		spawnGroupId: Agents.groupId(input),
		generation: positive(input.generation, 1),
		predecessorAgentId: Agents.clean(input.predecessorAgentId, 120),
		fanOutTier: scale,
		physicalTabPolicy: {
			maxActiveTabs: 1,
			intervalAnchor: "verified-tab-close",
			postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
		},
		subagentPolicy: subagentPolicy(input, scale, count, maxTotalWebsiteAgents, maxSubagentsPerAgent, startSpacingMs),
		startSpacingMs,
		collaborationRounds: Policy.bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: Policy.bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: Policy.bounded(input.authPollMs, 3000, 1000, 30000),
		agents: Agents.create(count, scopes, projectRoot, input)
	};
}

function subagentPolicy(input, scale, count, maxTotal, maxPerAgent, startSpacingMs) {
	return {
		mode: "bounded-flat-peers",
		topology: "flatland",
		priority: ["large", "enormous"].includes(scale) ? "required-when-available" : "preferred",
		allowRecursiveSubagents: input.allowRecursiveSubagents !== false && input.allowRecursiveSubagents !== "false",
		maxSubagentDepth: 1,
		maxSubagentsPerAgent: maxPerAgent,
		maxHelpersPerAgent: maxPerAgent,
		maxTotalWebsiteAgents: maxTotal,
		subagentStartSpacingMs: Policy.spacing(input.subagentStartSpacingMs, startSpacingMs),
		pressureAwareActivation: input.pressureAwareActivation !== false && input.pressureAwareActivation !== "false",
		spawnDrainQuantum: Policy.bounded(input.spawnDrainQuantum, 4, 1, 16),
		spawnDrainMaxQuanta: Policy.bounded(input.spawnDrainMaxQuanta, 2, 1, 8),
		softPressureQuantum: Policy.bounded(input.softPressureQuantum, 1, 1, 2),
		spawnDrainWakeMs: Policy.bounded(input.spawnDrainWakeMs, 1000, 250, 60000),
		softPressureWakeMs: Policy.bounded(input.softPressureWakeMs, 1500, 1500, 60000),
		hardPressureWakeMs: Policy.bounded(input.hardPressureWakeMs, 3000, 3000, 60000),
		panicPressureWakeMs: Policy.bounded(input.panicPressureWakeMs, 5000, 5000, 60000),
		recursiveFanOut: "flat-peer-fan-out-with-stable-sponsor-keys",
		handoffRequired: true,
		roomUpdates: ["plan", "progress", "handoff", "completion"],
		logicalAgentCount: count
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	AWTSMOOS_SHLIACH_NAME: Target.AWTSMOOS_SHLIACH_NAME,
	AWTSMOOS_SHLIACH_URL: Target.AWTSMOOS_SHLIACH_URL,
	ROLES: Policy.ROLES,
	agentCount: Policy.agentCount,
	customGptTarget: Target.customGptTarget,
	plan,
	promptScale: Policy.promptScale,
	scopeCandidates: Scopes.scopeCandidates
};
