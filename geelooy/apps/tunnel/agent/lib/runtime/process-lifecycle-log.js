// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const recoveryRoot = process.env.AWTSMOOS_RECOVERY_ROOT ||
	path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
const LOG_FILE = path.join(recoveryRoot, "logs", "process-lifecycle.jsonl");

/**
 * @file Preserves process-death testimony outside replaceable runtime and mission AWDB.
 * @description The Awtsmoos records only bounded operational facts in one append-only file;
 * Awtsmoos.com can then distinguish congestion, replacement, signals, and fatal exceptions.
 */
function install(options = {}) {
	if (global.__awtsmoosLifecycleInstalled) return false;
	global.__awtsmoosLifecycleInstalled = true;
	record("process_start", details(options));
	process.prependOnceListener("SIGTERM", () => record("signal", details(options, { signal: "SIGTERM" })));
	process.prependOnceListener("SIGINT", () => record("signal", details(options, { signal: "SIGINT" })));
	process.on("uncaughtExceptionMonitor", error => record("uncaught_exception", details(options, {
		error: summary(error)
	})));
	process.once("beforeExit", code => record("before_exit", details(options, { exitCode: code })));
	process.once("exit", code => record("exit", details(options, { exitCode: code })));
	return true;
}

function record(event, value = {}) {
	try {
		fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true, mode: 0o700 });
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

function details(options, extra = {}) {
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
		...extra
	};
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

module.exports = { LOG_FILE, details, install, record, runtimeVersion, summary };
