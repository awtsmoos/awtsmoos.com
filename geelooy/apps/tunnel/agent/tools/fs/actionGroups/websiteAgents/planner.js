// B"H
// Boruch Hashem
// Blessed is He

const InitialAgents = require("./plannerAgents.js");
const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");
const Target = require("./plannerTarget.js");

/**
 * @file Plans unbounded logical delegation above one strictly paced physical browser.
 * @description
 * The Awtsmoos may reveal as many useful shluchim as the work requires; Awtsmoos.com
 * places no descendant count ceiling. Pressure delays physical activation while accepted
 * submission, verified target closure, and twenty-four quiet seconds guard the next tab.
 */
function plan(config = {}, input = {}) {
	const projectRoot = Scopes.canonicalProjectRoot(
		input.projectRoot || config.root || process.cwd()
	);
	const scale = Policy.promptScale(input);
	const count = Policy.agentCount(input, scale);
	const scopes = Scopes.scopeCandidates(projectRoot, input);
	const target = Target.customGptTarget(input);
	const startSpacingMs = Policy.spacing(input.startSpacingMs);
	const subagentStartSpacingMs = Policy.spacing(
		input.subagentStartSpacingMs,
		startSpacingMs
	);
	return {
		projectRoot,
		agentStartUrl: target.url,
		customGptName: target.name,
		requestedCount: input.agentCount ?? input.count ?? null,
		agentCount: count,
		initialSeedAgentLimit: Policy.MAX_INITIAL_SEED_AGENTS,
		minimumAgentCount: Policy.minimumAgentCount(input),
		continuationOnly: Policy.continuationOnly(input),
		fanOutTier: scale,
		physicalTabPolicy: physicalTabPolicy(),
		subagentPolicy: subagentPolicy(input, subagentStartSpacingMs),
		startSpacingMs,
		collaborationRounds: Policy.bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: Policy.bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: Policy.bounded(input.authPollMs, 3000, 1000, 30000),
		agents: InitialAgents.createInitialAgents(count, scopes, projectRoot)
	};
}

function physicalTabPolicy() {
	return {
		maxActiveTabs: 1,
		intervalAnchor: "accepted-submission-verified-tab-close",
		postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
	};
}

function subagentPolicy(input, spacingMs) {
	return {
		mode: "optional-unbounded-spaced",
		topology: "sponsor-lineage-flat-runtime",
		priority: "optional",
		allowRecursiveSubagents: enabled(input.allowRecursiveSubagents),
		unboundedLogicalDescendants: true,
		logicalAgentLimit: null,
		maxSubagentDepth: null,
		maxSubagentsPerAgent: null,
		maxTotalWebsiteAgents: null,
		subagentStartSpacingMs: spacingMs,
		pressureAwareActivation: enabled(input.pressureAwareActivation),
		spawnDrainQuantum: Policy.bounded(input.spawnDrainQuantum, 4, 1, 16),
		spawnDrainMaxQuanta: Policy.bounded(input.spawnDrainMaxQuanta, 2, 1, 8),
		softPressureQuantum: Policy.bounded(input.softPressureQuantum, 1, 1, 2),
		spawnDrainWakeMs: Policy.bounded(input.spawnDrainWakeMs, 1000, 250, 60000),
		softPressureWakeMs: Policy.bounded(input.softPressureWakeMs, 1500, 1500, 60000),
		hardPressureWakeMs: Policy.bounded(input.hardPressureWakeMs, 3000, 3000, 60000),
		panicPressureWakeMs: Policy.bounded(input.panicPressureWakeMs, 5000, 5000, 60000),
		recursiveFanOut: "optional-count-unbounded-logical-fan-out",
		descendantAdmission: "count-unbounded-pressure-paced",
		handoffRequired: true,
		roomUpdates: ["plan", "progress", "handoff", "completion"]
	};
}

function enabled(value) {
	return value !== false && value !== "false";
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
