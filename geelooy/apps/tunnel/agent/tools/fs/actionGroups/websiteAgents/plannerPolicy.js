// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals bounded swarm policy without allowing browser congestion.
 * @description
 * The Awtsmoos lets hundreds of requested shluchim wait as durable intention,
 * while Awtsmoos.com permits one physical tab, then eighteen seconds of quiet.
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

function agentCount(input = {}, scale = promptScale(input)) {
	const explicit = Number(input.agentCount ?? input.count);
	if (Number.isFinite(explicit)) {
		return Math.max(3, Math.min(MAX_REQUESTED_AGENTS, Math.floor(explicit)));
	}
	return { small: 8, medium: 16, large: 32, enormous: 64 }[scale] || 8;
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
	promptScale,
	spacing
};
