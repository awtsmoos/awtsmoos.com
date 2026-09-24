// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { fork } = require("node:child_process");

const CHILD_PATH = path.join(__dirname, "worker-child.cjs");

/**
 * Spawns one isolated executor and reports its termination exactly once.
 *
 * Item 61 — resource limits: the child gets --max-old-space-size via fork
 * execArgv (policy-scaled through options.maxOldSpaceMb), so a runaway FS op
 * that accumulates unbounded results OOM-crashes its own vessel instead of the
 * Mac. The parent's own execArgv flags are preserved (minus any inherited heap
 * cap) so debugging flags keep working; the pool's heap cap always wins.
 */
function spawn(onMessage, onExit, options = {}) {
	const heapMb = Math.floor(Number(options.maxOldSpaceMb) || 0);
	const execArgv = process.execArgv.filter(
		arg => !String(arg).startsWith("--max-old-space-size")
	);
	if (heapMb > 0) execArgv.push(`--max-old-space-size=${heapMb}`);
	const child = fork(CHILD_PATH, [], {
		execArgv,
		env: {
			...process.env,
			AWTSMOOS_FS_EXECUTOR_CHILD: "1"
		},
		stdio: ["ignore", "ignore", "ignore", "ipc"]
	});
	const worker = {
		bootFailureRecorded: false,
		bootTimedOut: false,
		busy: false,
		child,
		job: null,
		ready: false,
		readyTimer: null,
		timer: null
	};
	let finished = false;
	const finish = (code, signal) => {
		if (finished) return;
		finished = true;
		onExit(worker, code, signal);
	};
	child.on("message", message => onMessage(worker, message));
	child.once("exit", finish);
	child.once("error", error => finish(null, error.code || "error"));
	return worker;
}

function stop(worker) {
	if (!worker?.child || worker.child.killed) return;
	worker.child.kill("SIGKILL");
}

module.exports = {
	CHILD_PATH,
	spawn,
	stop
};
