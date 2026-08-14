// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");
const Target = require("./plannerTarget.js");

/**
 * @file Composes one durable congestion-safe flat website-agent mission plan.
 * @description The Awtsmoos may call hundreds of peer shluchim while Awtsmoos.com
 * keeps every logical agent at depth zero and opens only one verified-close tab.
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
		fanOutTier: scale,
		physicalTabPolicy: {
			maxActiveTabs: 1,
			intervalAnchor: "verified-tab-close",
			postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
		},
		subagentPolicy: {
			mode: "bounded-flat-peers",
			topology: "flatland",
			priority: ["large", "enormous"].includes(scale)
				? "required-when-available"
				: "preferred",
			allowRecursiveSubagents: input.allowRecursiveSubagents !== false &&
				input.allowRecursiveSubagents !== "false",
			maxSubagentDepth: 1,
			maxSubagentsPerAgent,
			maxHelpersPerAgent: maxSubagentsPerAgent,
			maxTotalWebsiteAgents,
			subagentStartSpacingMs: Policy.spacing(input.subagentStartSpacingMs, startSpacingMs),
			pressureAwareActivation: input.pressureAwareActivation !== false &&
				input.pressureAwareActivation !== "false",
			spawnDrainQuantum: Policy.bounded(input.spawnDrainQuantum, 4, 1, 16),
			spawnDrainMaxQuanta: Policy.bounded(input.spawnDrainMaxQuanta, 2, 1, 8),
			softPressureQuantum: Policy.bounded(input.softPressureQuantum, 1, 1, 2),
			spawnDrainWakeMs: Policy.bounded(input.spawnDrainWakeMs, 1000, 250, 60000),
			softPressureWakeMs: Policy.bounded(input.softPressureWakeMs, 1500, 1500, 60000),
			hardPressureWakeMs: Policy.bounded(input.hardPressureWakeMs, 3000, 3000, 60000),
			panicPressureWakeMs: Policy.bounded(input.panicPressureWakeMs, 5000, 5000, 60000),
			recursiveFanOut: "flat-peer-fan-out-with-stable-sponsor-keys",
			handoffRequired: true,
			roomUpdates: ["plan", "progress", "handoff", "completion"]
		},
		startSpacingMs,
		collaborationRounds: Policy.bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: Policy.bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: Policy.bounded(input.authPollMs, 3000, 1000, 30000),
		agents: createAgents(count, scopes, projectRoot)
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
	plan,
	promptScale: Policy.promptScale,
	scopeCandidates: Scopes.scopeCandidates
};
