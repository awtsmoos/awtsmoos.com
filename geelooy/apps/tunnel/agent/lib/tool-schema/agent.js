// B"H
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
 * B"H
 *
 * The schema tells remote AIs the actual consolidated-agent contract. Website
 * delegation is the ordinary default; direct provider messages and task-runner
 * work remain explicit choices instead of accidental fallbacks.
 */
function aiAgentSchema(name) {
	return objectSchema({
		mode: string(
			name === "agent"
				? AGENT_MODE_DESCRIPTION
				: "Optional action-specific mode alias."
		),
		agentMode: string("Alias for mode."),
		defaultMode: string(
			"Persistent default for mode=config: website-mission, message, spawn, or novel."
		),
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
		stream: bool("Use provider streaming when the selected mode supports it."),
		taskId: string("Durable task id."),
		websiteMissionId: string("Website mission id for status or continuation."),
		missionId: string("Mission id alias."),
		title: string("Task or mission title."),
		kind: string("Task kind."),
		projectRoot: string("Absolute project root available to the native tunnel."),
		outputDir: string("Output directory."),
		fileName: string("Output file name."),
		agentCount: integer("Requested website-agent count, bounded from 3 through 96. Omit for automatic 8/16/32/64 fan-out."),
		count: integer("Agent-count alias, bounded from 3 through 96."),
		allowRecursiveSubagents: bool("Allow every authenticated website agent to request bounded child agents."),
		maxSubagentDepth: integer("Maximum website-agent descendant depth, from 1 through 8; default 4."),
		maxSubagentsPerAgent: integer("Maximum bounded child agents each website agent may request, from 1 through 96; default 32."),
		maxTotalWebsiteAgents: integer("Global initial-plus-child website-agent cap, from 3 through 512; default 256."),
		subagentStartSpacingMs: integer("Minimum delay between child website prompt starts, at least 10000 ms."),
		scopes: array(string("Repository scope assigned to a website sub-agent.")),
		paths: array(string("Repository path assigned to a website sub-agent.")),
		directories: array(string("Directory assigned to a website sub-agent.")),
		startSpacingMs: integer("Minimum delay between website prompt starts."),
		collaborationRounds: integer("Requested shared-room collaboration rounds."),
		maxDepth: integer("Maximum child depth."),
		maxChildrenPerTask: integer("Maximum children per task."),
		maxTotalTasks: integer("Maximum total tasks."),
		pollIntervalMs: integer("Polling interval in milliseconds."),
		promotionCycles: integer("Generic task cycles."),
		agentCycles: integer("Required full agent work cycles."),
		chapterCycles: integer("Required full chapter-delegate work cycles."),
		providerTimeoutMs: integer("Provider timeout in milliseconds."),
		allowRecursiveSpawn: bool("Allow child spawning."),
		content: string("Plain prompt or JSON carrier."),
		params: object("Object carrier."),
		body: string("JSON carrier alias."),
		query: string("JSON/prompt carrier alias.")
	});
}

module.exports = { AGENT_MODE_DESCRIPTION, aiAgentSchema };
