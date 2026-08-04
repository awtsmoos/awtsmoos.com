// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");
const Target = require("./plannerTarget.js");

/**
 * @file Composes one durable, congestion-safe website-agent mission plan.
 * @description
 * The Awtsmoos may call a hundred shluchim, yet Awtsmoos.com opens only one tab;
 * all others remain queued behind verified close and eighteen seconds of calm.
 */
function plan(config = {}, input = {}) {
	const projectRoot = path.resolve(input.projectRoot || config.root || process.cwd());
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
		minimumAgentCount: 3,
		fanOutTier: scale,
		physicalTabPolicy: {
			maxActiveTabs: 1,
			intervalAnchor: "verified-tab-close",
			postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
		},
		subagentPolicy: {
			mode: "bounded-single-use",
			priority: ["large", "enormous"].includes(scale)
				? "required-when-available"
				: "preferred",
			allowRecursiveSubagents: input.allowRecursiveSubagents !== false &&
				input.allowRecursiveSubagents !== "false",
			maxSubagentDepth: Policy.bounded(input.maxSubagentDepth, 4, 1, 8),
			maxSubagentsPerAgent,
			maxHelpersPerAgent: maxSubagentsPerAgent,
			maxTotalWebsiteAgents,
			subagentStartSpacingMs: Policy.spacing(input.subagentStartSpacingMs, startSpacingMs),
			recursiveFanOut: "independent-scoped-work-with-stable-request-keys",
			handoffRequired: true,
			roomUpdates: ["plan", "progress", "handoff", "completion"]
		},
		startSpacingMs,
		collaborationRounds: Policy.bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: Policy.bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: Policy.bounded(input.authPollMs, 3000, 1000, 30000),
		agents: createAgents(count, scopes)
	};
}

function createAgents(count, scopes) {
	const width = Math.max(2, String(count).length);
	return Array.from({ length: count }, (_, index) => {
		const [role, focus, claimMode] = Policy.ROLES[index % Policy.ROLES.length];
		const ordinal = String(index + 1).padStart(width, "0");
		return {
			id: `website_${ordinal}_${role}`,
			name: `Website ${capitalize(role)} ${ordinal}`,
			role,
			focus,
			claimMode,
			scope: scopes[index % scopes.length],
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
