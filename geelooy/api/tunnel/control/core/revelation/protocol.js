//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical Awtsmoos Tunnel protocol v1 envelope validation.
 * @description One versioned request/response shape shared by server, native
 * agent, plugin, browser UI, CLI and mission engine. Validation happens at
 * every trust boundary; unknown fields are preserved, never silently trusted.
 */

const PROTOCOL_VERSION = "awtsmoos.tunnel/1";
const ACTIONS_PATTERN = /^[a-z][a-zA-Z0-9._-]{0,127}$/;
const MODES = new Set(["sync", "async", "stream"]);
const RESULT_KINDS = new Set(["inline", "reference", "paged", "none"]);

/**
 * Validates and normalizes one canonical request envelope.
 * @param {object} input Raw request from any client surface.
 * @returns {{ok:boolean, errors:string[], value:object|null}} Verdict + normalized request.
 */
function validateRequest(input) {
	const errors = [];
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		return { ok: false, errors: ["request must be an object"], value: null };
	}
	const version = String(input.version || PROTOCOL_VERSION);
	if (version !== PROTOCOL_VERSION) errors.push(`unsupported protocol version: ${version}`);
	const requestId = String(input.requestId || "");
	if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(requestId)) errors.push("requestId must be 8-128 safe characters");
	const action = String(input.action || "");
	if (!ACTIONS_PATTERN.test(action)) errors.push("action must be a canonical action name");
	const timeoutMs = clampInt(input.timeoutMs, 0, 86_400_000, errors, "timeoutMs");
	const mode = String(input.mode || "sync");
	if (!MODES.has(mode)) errors.push(`unknown execution mode: ${mode}`);
	const resultKind = String(input.expectedResult || "inline");
	if (!RESULT_KINDS.has(resultKind)) errors.push(`unknown expectedResult: ${resultKind}`);
	if (input.params !== undefined && (typeof input.params !== "object" || input.params === null || Array.isArray(input.params))) {
		errors.push("params must be an object");
	}
	if (errors.length) return { ok: false, errors, value: null };
	return {
		ok: true,
		errors,
		value: {
			version, requestId, action,
			deviceId: stringOrNull(input.deviceId),
			projectRoot: stringOrNull(input.projectRoot),
			params: input.params || {},
			idempotencyKey: stringOrNull(input.idempotencyKey),
			timeoutMs, mode, expectedResult: resultKind,
			capabilities: Array.isArray(input.capabilities) ? input.capabilities.map(String).slice(0, 64) : [],
			approval: input.approval && typeof input.approval === "object" ? input.approval : null
		}
	};
}

/**
 * Builds a canonical response envelope that distinguishes acceptance from completion.
 * @param {object} opts Response fields.
 * @returns {object} Canonical response.
 */
function makeResponse(opts = {}) {
	const status = String(opts.status || "failed");
	if (!RESPONSE_STATUSES.has(status)) throw new Error(`unknown response status: ${status}`);
	return {
		version: PROTOCOL_VERSION,
		requestId: String(opts.requestId || ""),
		status,
		retryable: Boolean(opts.retryable),
		resultAvailable: Boolean(opts.resultAvailable),
		requiresUserAction: Boolean(opts.requiresUserAction),
		errorCategory: opts.errorCategory ? String(opts.errorCategory) : null,
		result: opts.result === undefined ? null : opts.result,
		jobId: opts.jobId ? String(opts.jobId) : null
	};
}

const RESPONSE_STATUSES = new Set([
	"accepted", "queued", "running", "completed", "failed",
	"partial", "pending", "canceled", "unknown", "not_accepted"
]);

function clampInt(v, min, max, errors, name) {
	if (v === undefined || v === null) return 0;
	const n = Number(v);
	if (!Number.isFinite(n) || n < min || n > max) { errors.push(`${name} out of range ${min}-${max}`); return 0; }
	return Math.floor(n);
}
function stringOrNull(v) { const s = v === undefined || v === null ? "" : String(v); return s ? s.slice(0, 1024) : null; }

module.exports = { PROTOCOL_VERSION, RESPONSE_STATUSES, validateRequest, makeResponse };
