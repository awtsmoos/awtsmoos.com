// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { fork } = require("node:child_process");

const CHILD_PATH = path.join(__dirname, "worker-child.cjs");

/** Spawns one isolated executor and reports its termination exactly once. */
function spawn(onMessage, onExit) {
	const child = fork(CHILD_PATH, [], {
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
