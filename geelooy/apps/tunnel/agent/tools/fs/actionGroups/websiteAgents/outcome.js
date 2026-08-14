// B"H

const SECTION_NAMES = [
	"STATUS",
	"FINDINGS",
	"FILES",
	"MESSAGE TO ROOM",
	"SPAWN",
	"SUBAGENT REQUESTS",
	"NEXT"
];
const MAX_SPAWN_REQUESTS = 96;
const MAX_SPAWN_SECTION_CHARS = 1024 * 1024;
const MAX_SPAWN_INPUT_ITEMS = 256;
const MAX_CHILD_PROMPT_CHARS = 16000;

function analyze(answer = "", options = {}) {
	const text = String(answer || "").trim();
	const sections = parseSections(text);
	const status = String(sections.STATUS || "").trim();
	const next = String(sections.NEXT || "").trim();
	const explicitUnfinished = /\b(unfinished|incomplete|blocked|working|continue|remaining|needs? attention)\b/i
		.test(`${status}\n${next}`);
	const explicitComplete = /\b(complete|completed|done|finished|verified|passed)\b/i
		.test(status);
	const spawn = spawnSection(sections, options);
	const roomMessage = String(sections["MESSAGE TO ROOM"] || "").trim();
	return {
		complete: explicitComplete && !explicitUnfinished,
		status: status || "unspecified",
		next,
		files: lines(sections.FILES),
		roomMessage,
		roomUpdate: parseRoomUpdate(roomMessage),
		findings: String(sections.FINDINGS || "").trim(),
		spawnRequests: spawn.requests,
		spawnDiagnostics: spawn.diagnostics,
		hasStructuredStatus: Boolean(status),
		answerPreview: text.slice(0, 12000)
	};
}

function spawnSection(sections, options) {
	const canonical = Object.hasOwn(sections, "SPAWN");
	const legacy = Object.hasOwn(sections, "SUBAGENT REQUESTS");
	if (canonical && legacy) {
		return {
			requests: [],
			diagnostics: [{ code: "multiple_spawn_sections" }]
		};
	}
	return parseSpawnRequests(
		canonical ? sections.SPAWN : sections["SUBAGENT REQUESTS"],
		options
	);
}

function parseSections(text) {
	const pattern = new RegExp(`^(${SECTION_NAMES.join("|")}):?\\s*$`, "gmi");
	const source = String(text || "");
	const matches = [...source.matchAll(pattern)];
	const result = {};
	for (let index = 0; index < matches.length; index += 1) {
		const current = matches[index];
		const start = current.index + current[0].length;
		const end = matches[index + 1]?.index ?? source.length;
		result[current[1].toUpperCase()] = source.slice(start, end).trim();
	}
	return result;
}

function parseSpawnRequests(value, options = {}) {
	const diagnostics = [];
	const source = String(value || "").trim();
	if (!source) return { requests: [], diagnostics };
	if (source.length > MAX_SPAWN_SECTION_CHARS) {
		return rejected("spawn_section_too_large");
	}
	let parsed;
	try {
		parsed = JSON.parse(unfence(source));
	} catch {
		return rejected("invalid_spawn_json");
	}
	if (!Array.isArray(parsed)) return rejected("spawn_requests_must_be_array");
	const maxRequests = bounded(
		options.maxSpawnRequests,
		MAX_SPAWN_REQUESTS,
		0,
		MAX_SPAWN_REQUESTS
	);
	if (parsed.length > MAX_SPAWN_INPUT_ITEMS) {
		diagnostics.push({
			code: "spawn_input_items_truncated",
			limit: MAX_SPAWN_INPUT_ITEMS,
			received: parsed.length
		});
	}
	const requests = [];
	const requestIds = new Set();
	const payloads = new Set();
	for (const [index, raw] of parsed.slice(0, MAX_SPAWN_INPUT_ITEMS).entries()) {
		const normalized = normalizeSpawnRequest(raw);
		if (!normalized.ok) {
			diagnostics.push({ code: normalized.code, index });
			continue;
		}
		const request = normalized.request;
		if (normalized.warning) {
			diagnostics.push({
				code: normalized.warning,
				index,
				requestId: request.requestId,
				limit: MAX_CHILD_PROMPT_CHARS
			});
		}
		const payloadKey = [
			request.role.toLowerCase(),
			request.scope.toLowerCase(),
			request.prompt.replace(/\s+/g, " ").trim().toLowerCase()
		].join("\u0000");
		if (requestIds.has(request.requestId)) {
			diagnostics.push({
				code: "duplicate_spawn_request_id",
				index,
				requestId: request.requestId
			});
			continue;
		}
		requestIds.add(request.requestId);
		if (payloads.has(payloadKey)) {
			diagnostics.push({
				code: "duplicate_spawn_request_payload",
				index,
				requestId: request.requestId
			});
			continue;
		}
		payloads.add(payloadKey);
		if (requests.length >= maxRequests) {
			diagnostics.push({
				code: "spawn_request_limit_exceeded",
				index,
				requestId: request.requestId,
				limit: maxRequests
			});
			continue;
		}
		requests.push(request);
	}
	return { requests, diagnostics };

	function rejected(code) {
		return { requests: [], diagnostics: [{ code }] };
	}
}

function normalizeSpawnRequest(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return invalid("spawn_request_must_be_object");
	}
	const allowedKeys = new Set(["requestId", "role", "scope", "prompt"]);
	if (Object.keys(raw).some(key => !allowedKeys.has(key))) {
		return invalid("unexpected_spawn_request_field");
	}
	const requestId = String(raw.requestId || "").trim();
	const role = cleanSingleLine(raw.role, 80);
	const scope = normalizeScope(raw.scope);
	const sourcePrompt = String(raw.prompt || "").trim();
	if (!/^[a-z0-9][a-z0-9._:-]{0,95}$/.test(requestId)) {
		return invalid("invalid_spawn_request_id");
	}
	if (!role) return invalid("invalid_spawn_role");
	if (!scope) return invalid("invalid_spawn_scope");
	if (!sourcePrompt || sourcePrompt.includes("\u0000")) {
		return invalid("invalid_spawn_prompt");
	}
	const prompt = sourcePrompt.slice(0, MAX_CHILD_PROMPT_CHARS).trim();
	return {
		ok: true,
		request: { key: requestId, requestId, role, scope, prompt },
		warning: sourcePrompt.length > MAX_CHILD_PROMPT_CHARS
			? "spawn_prompt_truncated"
			: ""
	};
}

function parseRoomUpdate(value) {
	const result = {
		plan: "",
		progress: "",
		handoff: "",
		completion: "",
		complete: false
	};
	for (const line of String(value || "").split(/\r?\n/)) {
		const match = line.match(/^\s*(PLAN|PROGRESS|HANDOFF|COMPLETION)\s*:\s*(.+?)\s*$/i);
		if (!match) continue;
		result[match[1].toLowerCase()] = match[2].slice(0, 4000);
	}
	result.complete = Boolean(result.completion) &&
		/\b(complete|completed|done|finished|verified|passed)\b/i.test(result.completion) &&
		!/\b(pending|unfinished|incomplete|blocked|remaining|failed)\b/i.test(result.completion);
	return result;
}

function unfence(value) {
	const match = String(value).match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i);
	return match ? match[1].trim() : String(value).trim();
}

function normalizeScope(value) {
	let scope = cleanSingleLine(value, 512).replaceAll("\\", "/");
	if (!scope) return "";
	if (/^(?:\/|[a-z]:\/)/i.test(scope)) return "";
	scope = scope.replace(/^\.\//, "").replace(/\/{2,}/g, "/");
	if (scope.split("/").includes("..")) return "";
	return scope || ".";
}

function cleanSingleLine(value, maximum) {
	const text = String(value || "").trim();
	if (!text || text.length > maximum || /[\r\n\u0000]/.test(text)) return "";
	return text;
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function invalid(code) {
	return { ok: false, code };
}

function lines(value) {
	return String(value || "")
		.split(/\r?\n/)
		.map(item => item.replace(/^\s*[-*]\s*/, "").trim())
		.filter(Boolean)
		.slice(0, 100);
}

module.exports = {
	MAX_SPAWN_REQUESTS,
	analyze,
	normalizeSpawnRequest,
	parseRoomUpdate,
	parseSections,
	parseSpawnRequests,
	spawnSection
};
