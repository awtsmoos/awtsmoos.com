// B"H
// Boruch Hashem
// Blessed is He

const {
	objectSchema,
	string,
	integer,
	bool,
	object,
	array
} = require("./primitives.js");

const AGENT_MODE_DESCRIPTION = [
	"Omit mode to start an authenticated ChatGPT website mission.",
	"Website aliases: website-mission, website, council, delegate.",
	"Explicit provider/task modes: message, spawn, novel.",
	"Management modes: list, config, setKey, removeKey, status, result, tasks."
].join(" ");

/**
 * @file Declares count-unbounded logical delegation over one paced physical website lane.
 * @description
 * The Awtsmoos lets logical shluchim continue multiplying as useful work appears;
 * Awtsmoos.com bounds only the initial materialized cohort, while one authenticated tab,
 * accepted submission, verified closure, and twenty-four quiet seconds protect the machine.
 */
function aiAgentSchema(name) {
	return objectSchema({
		mode: string(name === "agent"
			? AGENT_MODE_DESCRIPTION
			: "Optional action-specific mode alias."),
		agentMode: string("Alias for mode."),
		defaultMode: string("Persistent default: website-mission, message, spawn, or novel."),
		provider: string("AI provider id: minimax, openrouter, groq."),
		providerId: string("Provider alias."),
		agent: string("Agent id alias."),
		agentId: string("Agent id, for example minimax-deep."),
		model: string("Provider model override."),
		message: string("Exact user message or mission prompt."),
		prompt: string("Prompt alias."),
		goal: string("Mission goal or JSON/prompt carrier alias."),
		system: string("System instruction override."),
		messages: array(objectSchema({
			role: string("system, user, or assistant."),
			content: string("Message content.")
		})),
		stream: bool("Use provider streaming when supported."),
		taskId: string("Durable task id."),
		websiteMissionId: string("Website mission id for status or continuation."),
		missionId: string("Mission id alias."),
		parentWebsiteMissionId: string("Existing parent website mission for a same-room child."),
		parentMissionId: string("Existing shared room mission id."),
		parentAgentId: string("Existing website parent agent id."),
		requestKey: string("Stable child request id for duplicate suppression."),
		spawnRequestKey: string("Stable child request id alias."),
		role: string("Child specialist role."),
		scope: string("Repository-relative child scope."),
		childPrompt: string("Exact child assignment."),
		title: string("Task or mission title."),
		kind: string("Task kind."),
		projectRoot: string("Absolute project root available to the native tunnel."),
		outputDir: string("Output directory."),
		fileName: string("Output file name."),
		agentCount: integer("Initial website-agent seed count, materialized from 3 through 512; descendants are not count-capped."),
		count: integer("Initial seed-count alias; recursive logical descendants remain count-unbounded."),
		allowRecursiveSubagents: bool("Allow optional recursive logical child-agent requests without a total count ceiling."),
		maxSubagentDepth: integer("Deprecated compatibility hint; non-enforcing for website logical descendants."),
		maxSubagentsPerAgent: integer("Deprecated compatibility hint; non-enforcing for website logical descendants."),
		maxTotalWebsiteAgents: integer("Deprecated compatibility hint; not a total website logical-agent limit."),
		subagentStartSpacingMs: integer("Physical subagent cooldown after accepted submission and verified tab close; values below 24000 are clamped."),
		scopes: array(string("Repository scope assigned to a website sub-agent.")),
		paths: array(string("Repository path assigned to a website sub-agent.")),
		directories: array(string("Directory assigned to a website sub-agent.")),
		startSpacingMs: integer("Physical website cooldown after accepted submission and verified tab close; values below 24000 are clamped."),
		collaborationRounds: integer("Requested shared-room collaboration rounds."),
		maxDepth: integer("Maximum child depth for generic non-website task runtimes."),
		maxChildrenPerTask: integer("Maximum children per generic task."),
		maxTotalTasks: integer("Maximum total generic tasks."),
		pollIntervalMs: integer("Polling interval in milliseconds."),
		promotionCycles: integer("Generic task cycles."),
		agentCycles: integer("Required full agent work cycles."),
		chapterCycles: integer("Required full chapter-delegate work cycles."),
		providerTimeoutMs: integer("Provider timeout in milliseconds."),
		allowRecursiveSpawn: bool("Allow generic child spawning."),
		reportId: string("Stable lifecycle report id."),
		complete: bool("Explicit verified-completion signal."),
		next: string("Exact unfinished next action."),
		findings: string("Verified agent findings."),
		files: array(string("Changed or verified file.")),
		references: array(string("Evidence reference.")),
		toAgent: string("Room message recipient or all."),
		content: string("Plain prompt or JSON carrier."),
		params: object("Object carrier."),
		body: string("JSON carrier alias."),
		query: string("JSON/prompt carrier alias.")
	});
}

module.exports = {
	AGENT_MODE_DESCRIPTION,
	aiAgentSchema
};
