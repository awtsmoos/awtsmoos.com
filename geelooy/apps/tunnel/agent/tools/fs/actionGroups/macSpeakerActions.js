// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");

const StateDir = require("./mac/stateDir.js");

/**
 * @file Mac speaker call-out / TTS actions (device-side, default ON).
 * @description
 * The Awtsmoos lets an authorized requester make the Mac speak aloud through
 * its own speakers — a TTS call-out like "Hey, come over here!" — and steer
 * the output volume. Awtsmoos.com keeps the master switch ON by default and
 * persists it beside the companion state, never inside the repository.
 *
 * Safety and courtesy rules (no trade-offs, no compromises):
 * - The master switch gates every audible action; it is ON on first run.
 * - Text is capped at 500 chars and must be non-empty.
 * - Rate limit: at least 5s between utterances per requester, at most 6 per
 *   rolling minute per requester. Excess calls fail loudly (never silently
 *   dropped on the floor) with `rate_limited` + retryAfterMs.
 * - Utterances serialize through one FIFO chain so overlapping speaks can
 *   never garble each other. Queue policy: DROP — if more than
 *   QUEUE_MAX_PENDING speaks are already waiting, the new one is rejected
 *   with `queue_full` (the caller retries); nothing is silently discarded
 *   after acceptance. macCallOut (attention) always joins the same queue so
 *   it never talks over a running utterance, but it bypasses the 5s gap
 *   because a call-out is urgent by definition.
 * - Every invocation is audit-logged with the requester's logical identity,
 *   a text hash (never the raw text), and the voice used.
 *
 * Registry-safety (incident 2026-09-20): the builder NEVER resolves identity
 * at build time. The registration manifest builds every action with an empty
 * payload; resolving identity there threw missing_logical_agent_id and killed
 * agent registration. Identity is resolved lazily inside speak/callOut
 * handlers only, and macSpeakerState never needs it at all.
 *
 * Testability: `context.testExec` (fake `(cmd, args, opts) ->
 * { stdout, stderr, status }`), `context.testStateDir`, and
 * `context.testNow` (fake ms clock) keep every test hermetic. No test may
 * touch real system state, real audio, or real user files.
 */

const SETTINGS_FILE = "speaker-settings.json";
const AUDIT_FILE = "speaker-audit.jsonl";
const AUDIT_CAP = 1000;

const TEXT_MAX = 500;
const RATE_LIMIT_MIN_GAP_MS = 5000;
const RATE_LIMIT_MAX_PER_MIN = 6;
const RATE_WINDOW_MS = 60000;
const QUEUE_MAX_PENDING = 3;
const CALL_OUT_VOLUME = 85;
const VOLUME_MIN = 0;
const VOLUME_MAX = 100;
const EXEC_TIMEOUT_MS = 30000;
const DEFAULT_CALL_OUT_MESSAGE = "Hey, come over here!";
const RATE_MIN_WPM = 50;
const RATE_MAX_WPM = 500;

/* ------------------------------------------------------------------ */
/* builder                                                               */
/* ------------------------------------------------------------------ */

/**
 * Builds the speaker actions. `context = { config, payload, ...test overrides }`.
 * Each handler is `async () => {...}` and never throws: failures return
 * `{ ok: false, error: "..." }`.
 */
function buildMacSpeakerActions(context = {}) {
	const { payload = {} } = context;
	// Resolve the caller's logical identity at invocation time, not build time
	// (incident 2026-09-20: build-time resolution aborted registration).
	const identity = () => requiredIdentity(payload.logicalAgentId);
	const safe = (fn) => async () => {
		try {
			return await fn();
		} catch (error) {
			return fail("internal_error", error && error.message ? error.message : String(error));
		}
	};
	return {
		macSpeakerState: safe(() => macSpeakerState(context)),
		macSpeakerSetEnabled: safe(() => macSpeakerSetEnabled(context)),
		macSpeak: safe(() => macSpeak(context, identity)),
		macCallOut: safe(() => macCallOut(context, identity)),
		macSpeakerVolume: safe(() => macSpeakerVolume(context))
	};
}

/* ------------------------------------------------------------------ */
/* shared helpers                                                      */
/* ------------------------------------------------------------------ */

function fail(error, detail) {
	const out = { ok: false, error };
	if (detail !== undefined && detail !== "") out.detail = String(detail).slice(0, 300);
	return out;
}

function clampInt(value, minimum, maximum, fallback) {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(n)));
}

function nowMs(context = {}) {
	return typeof context.testNow === "number" ? context.testNow : Date.now();
}

function stateDirOf(context = {}) {
	if (context.testStateDir) {
		fs.mkdirSync(context.testStateDir, { recursive: true });
		return context.testStateDir;
	}
	try {
		return StateDir.ensure();
	} catch {
		return null;
	}
}

/** Require the transport-normalized logical identity instead of accepting a target-agent field. */
function requiredIdentity(value) {
	const id = String(value || "").trim();
	if (id) return id;
	const error = new Error("missing_logical_agent_id");
	error.code = "missing_logical_agent_id";
	throw error;
}

/**
 * Runs one bounded command. Uses context.testExec when present, otherwise
 * execFile with a timeout. Never throws: always resolves { stdout, stderr, status }.
 */
async function runExec(context, cmd, args, opts = {}) {
	if (typeof context.testExec === "function") {
		try {
			const r = await context.testExec(cmd, args, opts);
			return {
				stdout: r && r.stdout != null ? String(r.stdout) : "",
				stderr: r && r.stderr != null ? String(r.stderr) : "",
				status: r && Number.isInteger(r.status) ? r.status : 0
			};
		} catch (error) {
			return { stdout: "", stderr: error && error.message ? error.message : String(error), status: 1 };
		}
	}
	return new Promise((resolve) => {
		execFile(
			cmd,
			args,
			{ timeout: opts.timeout || EXEC_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, encoding: "utf8" },
			(error, stdout, stderr) => {
				if (error) {
					resolve({
						stdout: String(stdout || ""),
						stderr: String(stderr || error.message || ""),
						status: typeof error.code === "number" ? error.code : -1
					});
					return;
				}
				resolve({ stdout: String(stdout || ""), stderr: String(stderr || ""), status: 0 });
			}
		);
	});
}

/* ------------------------------------------------------------------ */
/* settings + audit persistence                                        */
/* ------------------------------------------------------------------ */

function defaultSettings() {
	return { enabled: true, defaultVoice: "", defaultRate: 0, lastSpokeAt: 0 };
}

function loadSettings(context) {
	const settings = defaultSettings();
	const dir = stateDirOf(context);
	if (!dir) return settings;
	const file = path.join(dir, SETTINGS_FILE);
	try {
		const raw = fs.readFileSync(file, "utf8");
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === "object") {
			if (typeof parsed.enabled === "boolean") settings.enabled = parsed.enabled;
			if (typeof parsed.defaultVoice === "string") settings.defaultVoice = parsed.defaultVoice;
			if (Number.isFinite(Number(parsed.defaultRate))) settings.defaultRate = clampInt(parsed.defaultRate, RATE_MIN_WPM, RATE_MAX_WPM, 0);
			if (Number.isFinite(Number(parsed.lastSpokeAt))) settings.lastSpokeAt = Number(parsed.lastSpokeAt);
			return settings;
		}
	} catch {}
	// First run (or unreadable file): persist the default-enabled setting.
	try {
		fs.writeFileSync(file, JSON.stringify(settings, null, 2) + "\n", { mode: 0o600 });
	} catch {}
	return settings;
}

function saveSettings(context, settings) {
	const dir = stateDirOf(context);
	if (!dir) return false;
	try {
		fs.writeFileSync(path.join(dir, SETTINGS_FILE), JSON.stringify(settings, null, 2) + "\n", { mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

function textHash(text) {
	return crypto.createHash("sha256").update(String(text), "utf8").digest("hex").slice(0, 16);
}

function audit(context, entry) {
	const dir = stateDirOf(context);
	if (!dir) return;
	const file = path.join(dir, AUDIT_FILE);
	try {
		let lines = [];
		try {
			const raw = fs.readFileSync(file, "utf8");
			lines = raw.split("\n").filter((line) => line.trim() !== "");
		} catch {}
		lines.push(JSON.stringify(entry));
		while (lines.length > AUDIT_CAP) lines.shift();
		fs.writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 });
	} catch {}
}

/* ------------------------------------------------------------------ */
/* device primitives: say + osascript volume                           */
/* ------------------------------------------------------------------ */

/** One FIFO chain; overlapping speaks serialize and can never garble. */
let speakChain = Promise.resolve();
let pendingSpeaks = 0;
/** requester -> { lastAt, times[] } for the rate limiter. */
const rateState = new Map();

async function getOutputVolume(context) {
	const r = await runExec(context, "osascript", ["-e", "output volume of (get volume settings)"]);
	if (r.status !== 0) return { ok: false, error: "volume_read_failed", detail: r.stderr };
	const volume = clampInt(r.stdout.trim(), VOLUME_MIN, VOLUME_MAX, NaN);
	if (!Number.isFinite(volume)) return { ok: false, error: "volume_parse_failed", detail: r.stdout };
	return { ok: true, volume };
}

async function setOutputVolume(context, volume) {
	const n = clampInt(volume, VOLUME_MIN, VOLUME_MAX, NaN);
	if (!Number.isFinite(n)) return { ok: false, error: "invalid_volume" };
	const r = await runExec(context, "osascript", ["-e", `set volume output volume ${n}`]);
	if (r.status !== 0) return { ok: false, error: "volume_set_failed", detail: r.stderr };
	return { ok: true, volume: n };
}

function parseVoices(stdout) {
	const voices = [];
	for (const line of String(stdout || "").split("\n")) {
		const name = line.trim().split(/\s{2,}|\t/)[0].trim();
		if (name && !/^\s*$/.test(name)) voices.push(name);
	}
	return voices;
}

async function listVoices(context) {
	const r = await runExec(context, "say", ["-v", "?"]);
	if (r.status !== 0) return [];
	return parseVoices(r.stdout);
}

function checkRateLimit(requester, now) {
	let slot = rateState.get(requester);
	if (!slot) {
		slot = { lastAt: 0, times: [] };
		rateState.set(requester, slot);
	}
	slot.times = slot.times.filter((t) => now - t < RATE_WINDOW_MS);
	const gap = now - slot.lastAt;
	if (slot.lastAt > 0 && gap < RATE_LIMIT_MIN_GAP_MS) {
		return { limited: true, retryAfterMs: RATE_LIMIT_MIN_GAP_MS - gap };
	}
	if (slot.times.length >= RATE_LIMIT_MAX_PER_MIN) {
		const oldest = slot.times[0];
		return { limited: true, retryAfterMs: Math.max(0, RATE_WINDOW_MS - (now - oldest)) };
	}
	return { limited: false };
}

function markSpoke(requester, now) {
	let slot = rateState.get(requester);
	if (!slot) {
		slot = { lastAt: 0, times: [] };
		rateState.set(requester, slot);
	}
	slot.lastAt = now;
	slot.times.push(now);
}

/** Enqueue one utterance on the FIFO chain. Resolves with the speak result. */
function enqueueSpeak(work) {
	if (pendingSpeaks >= QUEUE_MAX_PENDING) {
		return Promise.resolve({ ok: false, error: "queue_full", queueDepth: pendingSpeaks });
	}
	pendingSpeaks += 1;
	const run = speakChain.then(work);
	speakChain = run.catch(() => {}).finally(() => {
		pendingSpeaks = Math.max(0, pendingSpeaks - 1);
	});
	return run;
}

async function doSay(context, { text, voice, rate }) {
	const args = [];
	if (voice) args.push("-v", voice);
	const wpm = clampInt(rate, RATE_MIN_WPM, RATE_MAX_WPM, 0);
	if (wpm > 0) args.push("-r", String(wpm));
	args.push(text);
	const startedAt = nowMs(context);
	const r = await runExec(context, "say", args, { timeout: EXEC_TIMEOUT_MS });
	if (r.status !== 0) return { ok: false, error: "speak_failed", detail: r.stderr };
	return { ok: true, elapsedMs: nowMs(context) - startedAt };
}

/* ------------------------------------------------------------------ */
/* handlers                                                            */
/* ------------------------------------------------------------------ */

async function macSpeakerState(context) {
	// Never touches identity: safe on empty payloads, safe at registry build.
	const settings = loadSettings(context);
	const vol = await getOutputVolume(context);
	const voices = await listVoices(context);
	return {
		ok: true,
		action: "macSpeakerState",
		enabled: settings.enabled,
		outputVolume: vol.ok ? vol.volume : null,
		volumeError: vol.ok ? undefined : vol.error,
		defaultVoice: settings.defaultVoice || null,
		defaultRate: settings.defaultRate || null,
		voices,
		queueDepth: pendingSpeaks,
		lastSpokeAt: settings.lastSpokeAt || null
	};
}

async function macSpeakerSetEnabled(context) {
	const { payload = {} } = context;
	const raw = payload.enabled;
	const enabled = raw === true || raw === 1 || raw === "true" || raw === "1" || raw === "on"
		? true
		: raw === false || raw === 0 || raw === "false" || raw === "0" || raw === "off"
			? false
			: undefined;
	if (enabled === undefined) return fail("missing_enabled", "payload.enabled must be true/false");
	const settings = loadSettings(context);
	settings.enabled = enabled;
	saveSettings(context, settings);
	return { ok: true, action: "macSpeakerSetEnabled", enabled };
}

function validateText(text) {
	const clean = String(text != null ? text : "").trim();
	if (!clean) return { ok: false, error: fail("missing_text") };
	if (clean.length > TEXT_MAX) return { ok: false, error: fail("text_too_long", `max ${TEXT_MAX} chars, got ${clean.length}`) };
	return { ok: true, text: clean };
}

async function macSpeak(context, identity) {
	const { payload = {} } = context;
	let requester;
	try {
		requester = identity();
	} catch {
		return fail("missing_logical_agent_id");
	}
	const settings = loadSettings(context);
	if (!settings.enabled) return fail("speaker_disabled");
	const checked = validateText(payload.text);
	if (!checked.ok) return checked.error;
	const now = nowMs(context);
	const limit = checkRateLimit(requester, now);
	if (limit.limited) {
		return { ok: false, error: "rate_limited", retryAfterMs: limit.retryAfterMs };
	}
	const voice = String(payload.voice || settings.defaultVoice || "").trim();
	const rate = payload.rate != null ? payload.rate : settings.defaultRate || 0;
	const queuedAt = now;
	const result = await enqueueSpeak(async () => {
		const said = await doSay(context, { text: checked.text, voice, rate });
		if (!said.ok) return said;
		markSpoke(requester, nowMs(context));
		const fresh = loadSettings(context);
		fresh.lastSpokeAt = nowMs(context);
		saveSettings(context, fresh);
		audit(context, {
			when: new Date(nowMs(context)).toISOString(),
			action: "macSpeak",
			requester,
			textLength: checked.text.length,
			textHash: textHash(checked.text),
			voice: voice || null
		});
		return {
			ok: true,
			action: "macSpeak",
			requester,
			textLength: checked.text.length,
			voice: voice || null,
			queuedMs: nowMs(context) - queuedAt
		};
	});
	return result;
}

async function macCallOut(context, identity) {
	const { payload = {} } = context;
	let requester;
	try {
		requester = identity();
	} catch {
		return fail("missing_logical_agent_id");
	}
	const settings = loadSettings(context);
	if (!settings.enabled) return fail("speaker_disabled");
	const message = String(payload.message || DEFAULT_CALL_OUT_MESSAGE).trim();
	if (!message) return fail("missing_text");
	if (message.length > TEXT_MAX) return fail("text_too_long", `max ${TEXT_MAX} chars, got ${message.length}`);
	const restoreVolume = payload.restoreVolume !== false && payload.restoreVolume !== "false" && payload.restoreVolume !== 0;
	const before = await getOutputVolume(context);
	const previousVolume = before.ok ? before.volume : null;
	const boosted = await setOutputVolume(context, CALL_OUT_VOLUME);
	if (!boosted.ok) return { ok: false, error: boosted.error, detail: boosted.detail };
	const voice = String(payload.voice || settings.defaultVoice || "").trim();
	const result = await enqueueSpeak(async () => {
		// Attention call-outs bypass the 5s courtesy gap (urgent by definition)
		// but still join the FIFO queue so they never talk over another utterance.
		const said = await doSay(context, { text: message, voice, rate: 0 });
		if (restoreVolume && previousVolume != null) {
			await setOutputVolume(context, previousVolume);
		}
		if (!said.ok) return said;
		const fresh = loadSettings(context);
		fresh.lastSpokeAt = nowMs(context);
		saveSettings(context, fresh);
		audit(context, {
			when: new Date(nowMs(context)).toISOString(),
			action: "macCallOut",
			requester,
			textLength: message.length,
			textHash: textHash(message),
			voice: voice || null,
			previousVolume,
			restored: restoreVolume && previousVolume != null
		});
		return {
			ok: true,
			action: "macCallOut",
			requester,
			previousVolume,
			boostedTo: CALL_OUT_VOLUME,
			restored: restoreVolume && previousVolume != null
		};
	});
	return result;
}

async function macSpeakerVolume(context) {
	const { payload = {} } = context;
	if (payload.volume == null || payload.volume === "") {
		const vol = await getOutputVolume(context);
		if (!vol.ok) return { ok: false, error: vol.error, detail: vol.detail };
		return { ok: true, action: "macSpeakerVolume", volume: vol.volume };
	}
	const set = await setOutputVolume(context, payload.volume);
	if (!set.ok) return { ok: false, error: set.error, detail: set.detail };
	return { ok: true, action: "macSpeakerVolume", volume: set.volume };
}

module.exports = {
	buildMacSpeakerActions,
	// exposed for tests and diagnosis only
	__speakerTest: { TEXT_MAX, RATE_LIMIT_MIN_GAP_MS, RATE_LIMIT_MAX_PER_MIN, CALL_OUT_VOLUME, DEFAULT_CALL_OUT_MESSAGE }
};
