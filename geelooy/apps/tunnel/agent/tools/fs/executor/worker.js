// B"H

const path = require("node:path");
const { fork } = require("node:child_process");

const CHILD_PATH = path.join(__dirname, "worker-child.cjs");

/** Spawns one disposable action executor with no inherited terminal handles. */
function spawn(onMessage, onExit) {
	const child = fork(CHILD_PATH, [], {
		env: {
			...process.env,
			AWTSMOOS_FS_EXECUTOR_CHILD: "1"
		},
		stdio: ["ignore", "ignore", "ignore", "ipc"]
	});
	const worker = {
		busy: false,
		child,
		job: null,
		ready: false,
		timer: null
	};
	child.on("message", message => onMessage(worker, message));
	child.on("exit", (code, signal) => onExit(worker, code, signal));
	child.on("error", error => onExit(worker, null, error.code || "error"));
	return worker;
}

/** Terminates a stuck child; its replacement is created lazily. */
function stop(worker) {
	if (!worker?.child || worker.child.killed) return;
	worker.child.kill("SIGKILL");
}

module.exports = {
	CHILD_PATH,
	spawn,
	stop
};
