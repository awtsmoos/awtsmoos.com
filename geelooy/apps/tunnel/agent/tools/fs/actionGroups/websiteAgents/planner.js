//B"H // Boruch Hashem // Blessed is He

const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");
const Target = require("./plannerTarget.js");

/**
 * @file Plans logical website-agent work above one strictly paced physical Shliach browser.
 * @description
 * The Awtsmoos separates durable mission identity from disposable browser sessions. Awtsmoos.com
 * preserves dispatcher testimony, bounded admission pressure, and exact first-turn intent while
 * allowing a large logical family to unfold behind one physically serialized browser vessel.
 */
function plan(config = {}, input = {}) {
	const projectRoot = Scopes.canonicalProjectRoot(input.projectRoot || config.root || process.cwd());
	const scale = Policy.promptScale(input);
	const count = Policy.agentCount(input, scale);
	const scopes = Scopes.scopeCandidates(projectRoot, input);
	const target = Target.customGptTarget(input);
	const startSpacingMs = Math.max(20000, Policy.spacing(input.startSpacingMs));
	const subagentStartSpacingMs = Math.max(20000, Policy.spacing(input.subagentStartSpacingMs, startSpacingMs));
	return {
		projectRoot,
		agentStartUrl: target.url,
		customGptName: target.name,
		promptMode: input.promptMode === "exact" ? "exact" : "enriched",
		dispatcherSession: dispatcherSession(input),
		requestedCount: input.agentCount ?? input.count ?? null,
		agentCount: count,
		minimumAgentCount: Policy.minimumAgentCount(input),
		continuationOnly: Policy.continuationOnly(input),
		fanOutTier: scale,
		physicalTabPolicy: {
			maxActiveTabs: 1,
			intervalAnchor: "verified-tab-close",
			postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
		},
		subagentPolicy: subagentPolicy(input, subagentStartSpacingMs),
		startSpacingMs,
		collaborationRounds: Policy.bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: Policy.bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: Policy.bounded(input.authPollMs, 3000, 1000, 30000),
		agents: createAgents(count, scopes, projectRoot)
	};
}

function subagentPolicy(input, subagentStartSpacingMs) {
	return {
		mode: "optional-unbounded-spaced",
		topology: "sponsor-lineage-flat-runtime",
		priority: "optional",
		allowRecursiveSubagents: input.allowRecursiveSubagents !== false && input.allowRecursiveSubagents !== "false",
		unboundedLogicalDescendants: true,
		logicalAgentLimit: null,
		maxSubagentDepth: null,
		maxTotalWebsiteAgents: Policy.bounded(input.maxTotalWebsiteAgents, Policy.MAX_REQUESTED_AGENTS, 1, Policy.MAX_REQUESTED_AGENTS),
		subagentStartSpacingMs,
		pressureAwareActivation: input.pressureAwareActivation !== false && input.pressureAwareActivation !== "false",
		spawnDrainQuantum: Policy.bounded(input.spawnDrainQuantum, 4, 1, 16),
		spawnDrainMaxQuanta: Policy.bounded(input.spawnDrainMaxQuanta, 2, 1, 8),
		softPressureQuantum: Policy.bounded(input.softPressureQuantum, 1, 1, 2),
		spawnDrainWakeMs: Policy.bounded(input.spawnDrainWakeMs, 1000, 250, 60000),
		softPressureWakeMs: Policy.bounded(input.softPressureWakeMs, 1500, 1500, 60000),
		hardPressureWakeMs: Policy.bounded(input.hardPressureWakeMs, 3000, 3000, 60000),
		panicPressureWakeMs: Policy.bounded(input.panicPressureWakeMs, 5000, 5000, 60000),
		recursiveFanOut: "optional-unbounded-logical-fan-out-with-stable-sponsor-keys",
		handoffRequired: true,
		roomUpdates: ["plan", "progress", "handoff", "completion"]
	};
}

function dispatcherSession(input = {}) {
	if (!input.agentSessionId && !input.dispatcherAutonomous) return null;
	return {
		agentSessionId: String(input.agentSessionId || ""),
		replacementOf: String(input.replacementOf || ""),
		autonomous: input.dispatcherAutonomous === true || input.dispatcherAutonomous === "true"
	};
}

function createAgents(count, scopes, projectRoot) {
	const width = Math.max(2, String(count).length);
	return Array.from({ length: count }, (_, index) => {
		const [role, focus, claimMode] = Policy.ROLES[index % Policy.ROLES.length];
		const ordinal = String(index + 1).padStart(width, "0");
		const scope = scopes[index % scopes.length];
		return {
			id: `website_${ordinal}_${role}`,
			name: `Website ${capitalize(role)} ${ordinal}`,
			role,
			focus,
			claimMode,
			scope,
			absoluteScope: Scopes.absoluteScope(projectRoot, scope),
			ordinal: index + 1
		};
	});
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
	AWTSMOOS_SHLIACH_NAME: Target.AWTSMOOS_SHLIACH_NAME,
	AWTSMOOS_SHLIACH_URL: Target.AWTSMOOS_SHLIACH_URL,
	ROLES: Policy.ROLES,
	agentCount: Policy.agentCount,
	customGptTarget: Target.customGptTarget,
	dispatcherSession,
	plan,
	promptScale: Policy.promptScale,
	scopeCandidates: Scopes.scopeCandidates,
	subagentPolicy
};
