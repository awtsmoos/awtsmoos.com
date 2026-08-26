// B"H
// Boruch Hashem
// Blessed is He

const { fork } = require("node:child_process");
const ChildLiveness = require("./controller-child-liveness.js");
const ChildRepair = require("./controller-child-repair.js");
const Config = require("./controller-process-config.js");
const Restart = require("./controller-process-restart.js");
const Watchdog = require("./controller-process-watchdog.js");

/**
 * @file Owns connection-child birth, exact repair, and generation identity.
 * @description
 * The Awtsmoos recreates the messenger without confusing an old exit with a new life.
 * Awtsmoos.com binds every exit to its exact child object while restart cadence and
 * liveness cadence remain in smaller vessels outside this identity-bearing supervisor.
 */
function createProcessSupervisor(options = {}) {
	let child = null;
	let stopping = false;
	const liveness = options.liveness || ChildLiveness.create(options.childLivenessOptions);
	const repair = options.repair || ChildRepair.create({
		getChild: () => child,
		log: options.log,
		...(options.childRepairOptions || {})
	});
	const restart = Restart.create({
		maximumDelayMs: Config.maximumRestartDelay(options),
		start
	});
	const watchdog = Watchdog.create({
		getChild: () => child,
		isStopping: () => stopping,
		liveness,
		repair
	});

	/** Forks one exact connection child and arms independent liveness supervision. */
	function start() {
		stopping = false;
		if (child?.connected) return child;
		const spawned = (options.forkChild || fork)(Config.childPath(options), [], {
			env: Config.childEnvironment(options),
			stdio: ["ignore", "inherit", "inherit", "ipc"]
		});
		child = spawned;
		liveness.started();
		spawned.on("message", handleMessage);
		spawned.on("exit", (code, signal) => handleExit(spawned, code, signal));
		spawned.on("error", error => {
			options.log("warn", `connection child error: ${error.message}`);
		});
		options.mirror({ childPid: spawned.pid, running: true });
		watchdog.start();
		return spawned;
	}

	/** Sends one IPC message only to the exact currently connected child. */
	function notify(message) {
		if (!child?.connected) return false;
		try {
			return child.send(message);
		} catch {
			return false;
		}
	}

	/** Marks every child IPC frame as liveness before routing its semantic meaning. */
	function handleMessage(message) {
		liveness.note();
		return options.handleMessage?.(message);
	}

	/** Reaps only the generation that actually emitted this exit event. */
	function handleExit(exitedChild, code, signal) {
		if (child !== exitedChild) return;
		repair.clear(Number(exitedChild?.pid || 0));
		child = null;
		options.mirror({ connected: false, exitCode: code, running: false, signal });
		if (!stopping) restart.schedule();
	}

	/** Delegates bounded semantic ambiguity to the existing exact-child repair covenant. */
	function requestRepair(reason) {
		if (stopping) return false;
		return repair.request(String(reason || "child_repair_requested"));
	}

	/** Stops restart machinery and terminates only the currently owned child. */
	function stop(stopMessage) {
		stopping = true;
		restart.stop();
		watchdog.stop();
		notify(stopMessage);
		repair.clear(Number(child?.pid || 0));
		child?.kill?.("SIGTERM");
		child = null;
	}

	return {
		livenessStatus: () => ({ ...liveness.status(), repair: repair.snapshot() }),
		markRegistered: restart.reset,
		notify,
		preventRestart: () => {
			stopping = true;
			restart.stop();
			watchdog.stop();
		},
		requestRepair,
		restartCount: () => restart.status().count,
		start,
		stop
	};
}

module.exports = {
	boundedRestartDelay: Config.boundedRestartDelay,
	createProcessSupervisor
};
