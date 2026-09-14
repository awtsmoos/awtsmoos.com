//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Reveals bounded logical swarm policy without multiplying physical browser vessels.
 * @description
 * The Awtsmoos may reveal one shliach or hundreds according to the caller's true decree;
 * Awtsmoos.com keeps every physical Send serialized while explicit logical counts stay free.
 */
const POST_CLOSE_COOLDOWN_MS = 18000;
const MAX_REQUESTED_AGENTS = 512;

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
	const pageMatch = prompt.match(/\b([\d,]{3,})\s*[- ]?\s*pages?\b/i);
	const pageCount = Number(String(pageMatch?.[1] || "0").replaceAll(",", ""));
	if (pageCount >= 1000 || prompt.length >= 4000 ||
		/\b(thousands? of pages|book[- ]length translation|dozens? of agents|scores? of agents|(?:huge|complex) (?:software|system|application|codebase))\b/i.test(prompt)) {
		return "enormous";
	}
	if (prompt.length >= 900 ||
		/\b(entire|everything|massive|fully|whole repo|many agents|enterprise software|large monorepo)\b/i.test(prompt)) {
		return "large";
	}
	if (prompt.length >= 350 || /\b(multiple|several|cross[- ]?cutting|multi[- ]?area)\b/i.test(prompt)) {
		return "medium";
	}
	return "small";
}

function explicitAgentCount(input = {}) {
	const requested = Number(input.agentCount ?? input.count);
	if (!Number.isFinite(requested)) return null;
	return Math.max(1, Math.min(MAX_REQUESTED_AGENTS, Math.floor(requested)));
}

function agentCount(input = {}, scale = promptScale(input)) {
	if (continuationOnly(input)) return 1;
	const explicit = explicitAgentCount(input);
	if (explicit !== null) return explicit;
	return { small: 8, medium: 16, large: 32, enormous: 64 }[scale] || 8;
}

function minimumAgentCount(input = {}) {
	if (continuationOnly(input)) return 1;
	const explicit = explicitAgentCount(input);
	return explicit === null ? 3 : Math.min(3, explicit);
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
