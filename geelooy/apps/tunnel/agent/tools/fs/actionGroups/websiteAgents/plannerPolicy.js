// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates finite initial seed materialization from unbounded logical descendants.
 * @description
 * The Awtsmoos may reveal endlessly many useful shluchim over time, while Awtsmoos.com
 * materializes a practical first cohort and keeps every physical browser turn behind
 * a twenty-four-second verified-close gate. Capacity is logical; concurrency is a vessel.
 */
const POST_CLOSE_COOLDOWN_MS = 24000;
const MAX_INITIAL_SEED_AGENTS = 512;
const MAX_REQUESTED_AGENTS = MAX_INITIAL_SEED_AGENTS;

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

function promptScale(input = {}) {
	const prompt = String(input.prompt || input.goal || input.message || "");
	const pageMatch = prompt.match(/([\d,]{3,})\s*[- ]?\s*pages?/i);
	const pageCount = Number(String(pageMatch?.[1] || "0").replaceAll(",", ""));
	if (pageCount >= 1000 || prompt.length >= 4000 || enormousPrompt(prompt)) {
		return "enormous";
	}
	if (prompt.length >= 900 || largePrompt(prompt)) {
		return "large";
	}
	if (prompt.length >= 350 || /(multiple|several|cross[- ]?cutting|multi[- ]?area)/i.test(prompt)) {
		return "medium";
	}
	return "small";
}

function enormousPrompt(prompt) {
	return /(thousands? of pages|book[- ]length translation|dozens? of agents|scores? of agents|(?:huge|complex) (?:software|system|application|codebase))/i.test(prompt);
}

function largePrompt(prompt) {
	return /(entire|everything|massive|fully|whole repo|many agents|enterprise software|large monorepo)/i.test(prompt);
}

function agentCount(input = {}, scale = promptScale(input)) {
	if (continuationOnly(input)) return 1;
	const explicit = Number(input.agentCount ?? input.count);
	if (Number.isFinite(explicit)) {
		return Math.max(
			3,
			Math.min(MAX_INITIAL_SEED_AGENTS, Math.floor(explicit))
		);
	}
	return { small: 8, medium: 16, large: 32, enormous: 64 }[scale] || 8;
}

function minimumAgentCount(input = {}) {
	return continuationOnly(input) ? 1 : 3;
}

function continuationOnly(input = {}) {
	return input.continuationOnly === true || input.continuationOnly === "true";
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function spacing(value, fallback = POST_CLOSE_COOLDOWN_MS) {
	return bounded(value, fallback, POST_CLOSE_COOLDOWN_MS, 60000);
}

module.exports = {
	MAX_INITIAL_SEED_AGENTS,
	MAX_REQUESTED_AGENTS,
	POST_CLOSE_COOLDOWN_MS,
	ROLES,
	agentCount,
	bounded,
	continuationOnly,
	minimumAgentCount,
	promptScale,
	spacing
};
