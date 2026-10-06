// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");

const recoveryRoot = process.env.AWTSMOOS_RECOVERY_ROOT ||
	path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
const LOG_FILE = path.join(recoveryRoot, "logs", "process-lifecycle.jsonl");

/**
 * Default rotation policy: 10MB active file + 3 compressed generations.
 * Overridable per-call or via AWTSMOOS_LOG_MAX_BYTES / AWTSMOOS_LOG_GENERATIONS.
 */
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_GENERATIONS = 3;

function rotationOptions(overrides = {}) {
	const maxBytes = overrides.maxBytes ??
		(process.env.AWTSMOOS_LOG_MAX_BYTES ? Number(process.env.AWTSMOOS_LOG_MAX_BYTES) : DEFAULT_MAX_BYTES);
	const generations = overrides.generations ??
		(process.env.AWTSMOOS_LOG_GENERATIONS ? Number(process.env.AWTSMOOS_LOG_GENERATIONS) : DEFAULT_GENERATIONS);
	return { maxBytes: Math.max(1024, maxBytes || DEFAULT_MAX_BYTES), generations: Math.max(1, generations || DEFAULT_GENERATIONS) };
}

/**
 * Crash-safe log rotation: size AND count bounded.
 *
 * Active file stays bounded at maxBytes; generations older than `generations`
 * are deleted. The active record is never at risk: the compressed copy of the
 * old active file is fully written to a temp file and atomically renamed to
 * `.1.gz` BEFORE the active file is truncated, so a crash at any point leaves
 * either the complete old active file or a complete `.1.gz` — never a gap.
 *
 * Reusable by any bounded writer (lifecycle log, recovery logs, etc.).
 *
 * @param {string} logFile absolute path of the active log file
 * @param {{maxBytes?: number, generations?: number}} [overrides]
 * @returns {boolean} true when rotation ran, false when the file is within cap
 */
function rotateLog(logFile, overrides = {}) {
	const { maxBytes, generations } = rotationOptions(overrides);
	let size = 0;
	try { size = fs.statSync(logFile).size; } catch { return false; }
	if (size <= maxBytes) return false;
	try { fs.mkdirSync(path.dirname(logFile), { recursive: true, mode: 0o700 }); } catch {}

	// Oldest generation dies first; shift N-1 -> N so .1 is always newest.
	try { fs.rmSync(`${logFile}.${generations}.gz`, { force: true }); } catch {}
	for (let i = generations - 1; i >= 1; i--) {
		try { fs.renameSync(`${logFile}.${i}.gz`, `${logFile}.${i + 1}.gz`); } catch {}
	}

	// Compress the old active file to a temp name, then atomically promote it.
	// Crash between here and the rename leaves the old active file intact.
	const tmp = `${logFile}.1.gz.tmp.${process.pid}`;
	try {
		const raw = fs.readFileSync(logFile);
		const tmpFd = fs.openSync(tmp, "w", 0o600);
		try { fs.writeSync(tmpFd, zlib.gzipSync(raw)); } finally { fs.closeSync(tmpFd); }
		fs.renameSync(tmp, `${logFile}.1.gz`);
	} catch {
		try { fs.rmSync(tmp, { force: true }); } catch {}
		return false;
	}

	// Only now is the active file safe to truncate: its bytes already live in .1.gz.
	try { fs.truncateSync(logFile, 0); } catch {
		try { fs.rmSync(logFile, { force: true }); } catch {}
	}
	return true;
}

/**
 * @file Preserves process-death testimony outside replaceable runtime and mission AWDB.
 * @description The Awtsmoos records only bounded operational facts in one append-only file;
 * Awtsmoos.com can then distinguish congestion, replacement, signals, and fatal exceptions.
 */
function install(options = {}) {
	if (global.__awtsmoosLifecycleInstalled) return false;
	global.__awtsmoosLifecycleInstalled = true;
	record("process_start", details("process_start", options));
	process.prependOnceListener("SIGTERM", () => record("signal", details("signal", options, { signal: "SIGTERM" })));
	process.prependOnceListener("SIGINT", () => record("signal", details("signal", options, { signal: "SIGINT" })));
	process.on("uncaughtExceptionMonitor", error => record("uncaught_exception", details("uncaught_exception", options, {
		error: summary(error)
	})));
	process.once("beforeExit", code => record("before_exit", details("before_exit", options, { exitCode: code })));
	process.once("exit", code => record("exit", details("exit", options, { exitCode: code })));
	return true;
}

/**
 * Routine events (process_start, heartbeat, signal, exits) get a short summary:
 * timestamps, pids, lane health as ok/degraded flags, queue depths as numbers.
 * Failure/debug events get the full diagnostic snapshot.
 */
const ROUTINE_EVENTS = new Set(["process_start", "heartbeat", "signal", "before_exit", "exit"]);

function details(event, options = {}, extra = {}) {
	return ROUTINE_EVENTS.has(event)
		? { ...compactDetails(options), ...extra }
		: { ...fullDetails(options), ...extra };
}

/**
 * Short operational summary for routine records. Bounded by construction:
 * no per-lane/per-limit/per-queue metric objects, only flags and numbers.
 */
function compactDetails(options = {}) {
	let snapshot = {};
	try { snapshot = options.snapshot?.({ workers: false }) || {}; } catch {}
	const connection = snapshot.connection || snapshot;
	const memory = process.memoryUsage();
	return {
		eventLoopLagMs: num(snapshot.eventLoopLag),
		laneHealth: laneFlags(snapshot.lanes),
		queueDepths: queueNumbers(connection),
		mailboxHealth: flagOf(connection.mailbox?.health),
		websocket: connection.connected ? "connected" : "disconnected",
		localApi: options.localApiState?.() || "unknown",
		rss: memory.rss,
		heapUsed: memory.heapUsed,
	};
}

/**
 * Full diagnostic snapshot. Emitted ONLY for failure/debug events
 * (uncaught_exception, debug_*) — never for routine telemetry.
 */
function fullDetails(options = {}) {
	let snapshot = {};
	try { snapshot = options.snapshot?.({ workers: false }) || {}; } catch {}
	const connection = snapshot.connection || snapshot;
	const memory = process.memoryUsage();
	return {
		eventLoopLag: snapshot.eventLoopLag || null,
		circuit: snapshot.circuit || null,
		lanes: snapshot.lanes || null,
		mailbox: connection.mailbox?.health || null,
		websocketState: connection.connected ? "connected" : "disconnected",
		localApiState: options.localApiState?.() || "unknown",
		rss: memory.rss,
		heapUsed: memory.heapUsed,
	};
}

function num(v) {
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** @returns per-lane ok/degraded flags instead of full lane metric objects */
function laneFlags(lanes) {
	if (!lanes || typeof lanes !== "object") return null;
	const out = {};
	for (const [name, lane] of Object.entries(lanes)) out[name] = flagOf(lane?.health ?? lane);
	return out;
}

/** @returns per-queue depths as numbers instead of full queue counter objects */
function queueNumbers(connection) {
	const queues = connection?.queues || connection?.mailbox?.queues;
	if (!queues || typeof queues !== "object") return null;
	const out = {};
	for (const [name, q] of Object.entries(queues)) {
		const depth = num(q?.depth ?? q?.length ?? q?.pending ?? q);
		out[name] = depth;
	}
	return out;
}

/** Collapse any health value to an ok/degraded flag. */
function flagOf(health) {
	if (health == null) return null;
	const s = String(health).toLowerCase();
	if (/(^|[^a-z])(ok|healthy|up|open|connected)([^a-z]|$)/.test(s)) return "ok";
	if (/(^|[^a-z])(degraded|warn|warning|down|closed|disconnected|error|fail)([^a-z]|$)/.test(s)) return "degraded";
	return s.slice(0, 32);
}

function record(event, value = {}, rotation = {}) {
	try {
		fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true, mode: 0o700 });
		rotateLog(LOG_FILE, rotation);
		fs.appendFileSync(LOG_FILE, `${JSON.stringify({
			at: new Date().toISOString(),
			pid: process.pid,
			ppid: process.ppid,
			version: runtimeVersion(),
			generation: process.env.AWTSMOOS_ACTIVATION_ID || "",
			candidateMode: process.env.AWTSMOOS_REGISTRATION_MODE || "owning",
			event,
			...value
		})}\n`, { encoding: "utf8", mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

function runtimeVersion() {
	if (process.env.AWTSMOOS_RUNTIME_VERSION) return process.env.AWTSMOOS_RUNTIME_VERSION;
	try {
		const root = process.env.AWTSMOOS_INSTALL_ROOT || process.cwd();
		return fs.readFileSync(path.join(root, "install-state.txt"), "utf8").trim();
	} catch {
		return "";
	}
}

function summary(error) {
	return String(error?.stack || error?.message || error || "unknown").slice(0, 4000);
}

module.exports = {
	LOG_FILE, details, compactDetails, fullDetails, install, record,
	rotateLog, rotationOptions, runtimeVersion, summary,
};
