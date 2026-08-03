// B"H
const fs = require("node:fs");
const path = require("node:path");

const AWTSMOOS_SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const AWTSMOOS_SHLIACH_NAME = "Awtsmoos Shliach";

const ROLES = [
	["architect", "Architecture and dependency boundaries", "write"],
	["transport", "Tunnel transport, liveness, reconnect, and receipts", "write"],
	["runtime", "Runtime queues, workers, commands, and durable state", "write"],
	["browser", "Chrome, CDP, Playwright, Puppeteer, and preview control", "write"],
	["security", "Authentication, privacy, permissions, and secret handling", "review"],
	["frontend", "User flow, responsive UI, accessibility, and CSS", "write"],
	["testing", "Focused regression and fault-injection tests", "write"],
	["stress", "Concurrency, soak, overload, and recovery analysis", "review"],
	["installer", "Installer, upgrades, rollback, and release manifest", "write"],
	["reviewer", "Cross-area review, race detection, and integration risks", "review"],
	["docs", "Agent instructions, operator recovery, and observability", "write"],
	["verifier", "Independent completion and evidence audit", "review"]
];

function plan(config = {}, input = {}) {
	const projectRoot = path.resolve(input.projectRoot || config.root || process.cwd());
	const scale = promptScale(input);
	const count = agentCount(input, scale);
	const scopes = scopeCandidates(projectRoot, input);
	const target = customGptTarget(input);
	const startSpacingMs = bounded(input.startSpacingMs, 12000, 10000, 60000);
	const maxTotalWebsiteAgents = bounded(
		input.maxTotalWebsiteAgents,
		256,
		count,
		512
	);
	const maxSubagentsPerAgent = bounded(
		input.maxSubagentsPerAgent ?? input.maxHelpersPerAgent,
		32,
		1,
		96
	);
	const agents = Array.from({ length: count }, (_, index) => {
		const [role, focus, claimMode] = ROLES[index % ROLES.length];
		const ordinal = String(index + 1).padStart(2, "0");
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
	return {
		projectRoot,
		agentStartUrl: target.url,
		customGptName: target.name,
		requestedCount: input.agentCount ?? input.count ?? null,
		agentCount: count,
		minimumAgentCount: 3,
		fanOutTier: scale,
		subagentPolicy: {
			mode: "bounded-single-use",
			priority: ["large", "enormous"].includes(scale)
				? "required-when-available"
				: "preferred",
			allowRecursiveSubagents: input.allowRecursiveSubagents !== false &&
				input.allowRecursiveSubagents !== "false",
			maxSubagentDepth: bounded(input.maxSubagentDepth, 4, 1, 8),
			maxSubagentsPerAgent,
			maxHelpersPerAgent: maxSubagentsPerAgent,
			maxTotalWebsiteAgents,
			subagentStartSpacingMs: bounded(
				input.subagentStartSpacingMs,
				startSpacingMs,
				10000,
				60000
			),
			recursiveFanOut: "independent-scoped-work-with-stable-request-keys",
			handoffRequired: true,
			roomUpdates: ["plan", "progress", "handoff", "completion"]
		},
		startSpacingMs,
		collaborationRounds: bounded(input.collaborationRounds, 2, 1, 8),
		maxContinuationTurns: bounded(input.maxContinuationTurns, 6, 1, 12),
		authPollMs: bounded(input.authPollMs, 3000, 1000, 30000),
		agents
	};
}

function customGptTarget(input = {}) {
	const raw = String(
		input.agentStartUrl || input.customGptUrl || input.gptUrl || AWTSMOOS_SHLIACH_URL
	).trim();
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw invalidTarget();
	}
	url.search = "";
	url.hash = "";
	url.pathname = url.pathname.replace(/\/c\/[^/]+\/?$/, "").replace(/\/$/, "");
	const normalized = url.toString().replace(/\/$/, "");
	if (normalized !== AWTSMOOS_SHLIACH_URL) throw invalidTarget();
	return {
		name: AWTSMOOS_SHLIACH_NAME,
		url: AWTSMOOS_SHLIACH_URL
	};
}

function invalidTarget() {
	const error = new Error("invalid_chatgpt_custom_gpt_url");
	error.code = "invalid_chatgpt_custom_gpt_url";
	return error;
}

function agentCount(input = {}, scale = promptScale(input)) {
	const explicit = Number(input.agentCount ?? input.count);
	if (Number.isFinite(explicit)) return Math.max(3, Math.min(96, Math.floor(explicit)));
	return {
		small: 8,
		medium: 16,
		large: 32,
		enormous: 64
	}[scale] || 8;
}

function promptScale(input = {}) {
	const prompt = String(input.prompt || input.goal || input.message || "");
	const pageMatch = prompt.match(/\b([\d,]{3,})\s*[- ]?\s*pages?\b/i);
	const pageCount = Number(String(pageMatch?.[1] || "0").replaceAll(",", ""));
	if (pageCount >= 1000 || prompt.length >= 4000 ||
		/\b(thousands? of pages|book[- ]length translation|complete translation of (?:the )?(?:entire|whole)|dozens? of agents|scores? of agents|(?:huge|complex) (?:software|system|application|codebase))\b/i.test(prompt)) {
		return "enormous";
	}
	if (prompt.length >= 900 ||
		/\b(entire|everything|massive|fully|all areas|whole repo|many agents|enterprise software|entire software|whole software|full software platform|large monorepo|massive (?:software|system|application|codebase))\b/i.test(prompt)) {
		return "large";
	}
	if (prompt.length >= 350 ||
		/\b(multiple|several|cross[- ]?cutting|multi[- ]?area)\b/i.test(prompt)) {
		return "medium";
	}
	return "small";
}

function scopeCandidates(projectRoot, input = {}) {
	const supplied = array(input.scopes || input.directories || input.paths);
	const mentioned = pathMentions(String(input.prompt || input.goal || input.message || ""));
	const discovered = topLevelDirectories(projectRoot);
	const values = [...supplied, ...mentioned, ...discovered]
		.map(value => normalizeScope(projectRoot, value))
		.filter(Boolean);
	const unique = [...new Set(values)].slice(0, 48);
	return unique.length ? unique : ["."];
}

function pathMentions(text) {
	return (text.match(/(?:^|[\s"'`(])(?:\.?\/)?[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+/g) || [])
		.map(value => value.trim().replace(/^["'`(]+|[,"'`)]+$/g, ""));
}

function topLevelDirectories(root) {
	try {
		return fs.readdirSync(root, { withFileTypes: true })
			.filter(entry => entry.isDirectory() && !entry.name.startsWith(".") &&
				!["node_modules", "logs", "dist", "build"].includes(entry.name))
			.map(entry => entry.name)
			.slice(0, 24);
	} catch {
		return [];
	}
}

function normalizeScope(root, value) {
	const text = String(value || "").trim();
	if (!text || text.includes("\0")) return "";
	const absolute = path.resolve(root, text);
	const relative = path.relative(root, absolute);
	if (relative === ".." || relative.startsWith(`..${path.sep}`)) return "";
	return relative || ".";
}

function array(value) {
	if (Array.isArray(value)) return value.map(String);
	if (!value) return [];
	try {
		const parsed = JSON.parse(String(value));
		if (Array.isArray(parsed)) return parsed.map(String);
	} catch {}
	return String(value).split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
	AWTSMOOS_SHLIACH_NAME,
	AWTSMOOS_SHLIACH_URL,
	ROLES,
	agentCount,
	customGptTarget,
	plan,
	promptScale,
	scopeCandidates
};
