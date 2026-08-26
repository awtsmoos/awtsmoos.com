// B"H
// Boruch Hashem
// Blessed is He

const { fork } = require("node:child_process");
const ChildLiveness = require("./controller-child-liveness.js");
const ChildRepair = require("./controller-child-repair.js");
const Config = require("./controller-process-config.js");

/**
 * @file Owns connection-child birth, message liveness, exact repair, and bounded restart.
 * @description
 * The Awtsmoos recreates the messenger without confusing silence with death.
 * Awtsmoos.com watches every valid IPC breath, grants startup and lag grace, and
 * replaces only the exact owned child when sustained silence survives those gates.
 */
function createProcessSupervisor(options = {}) {
	let child = null;
	let restartTimer = null;
	let livenessTimer = null;
	let restartCount = 0;
	let stopping = false;
	const maximumRestartDelayMs = Config.maximumRestartDelay(options);
	const liveness = options.liveness || ChildLiveness.create(options.childLivenessOptions);
	const repair = options.repair || ChildRepair.create({
		getChild: () => child,
		log: options.log,
		...(options.childRepairOptions || {})
	});

	/** Forks one connection child and arms independent IPC-liveness supervision. */
	function start() {
		stopping = false;
		if (child?.connected) return child;
		child = (options.forkChild || fork)(Config.childPath(options), [], {
			env: Config.childEnvironment(options),
			stdio: ["ignore", "inherit", "inherit", "ipc"]
		});
		liveness.started();
		child.on("message", handleMessage);
		child.on("exit", handleExit);
		child.on("error", error => {
			options.log("warn", `connection child error: ${error.message}`);
		});
		options.mirror({ childPid: child.pid, running: true });
		armLivenessTimer();
		return child;
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

	/** Marks every child IPC message as independent liveness before routing its meaning. */
	function handleMessage(message) {
		liveness.note();
		return options.handleMessage?.(message);
	}

	/** Reaps state for the exact exited generation and schedules bounded replacement. */
	function handleExit(code, signal) {
		const exitedPid = Number(child?.pid || 0);
		repair.clear(exitedPid);
		child = null;
		options.mirror({ connected: false, exitCode: code, running: false, signal });
		if (stopping) return;
		restartCount += 1;
		const delay = Math.min(
			maximumRestartDelayMs,
			250 * 2 ** Math.min(restartCount, 7)
		);
		restartTimer = setTimeout(start, delay);
		restartTimer.unref?.();
	}

	/** Polls only the independent child IPC cadence; actual signalling lives in ChildRepair. */
	function inspectLiveness() {
		if (!child || stopping) return;
		const report = liveness.inspect();
		if (report.shouldRestart) repair.request(report.reason);
	}

	/** Arms one unrefed periodic liveness timer for the parent process lifetime. */
	function armLivenessTimer() {
		if (livenessTimer) return;
		const intervalMs = Number(liveness.status().checkMs || ChildLiveness.DEFAULT_CHECK_MS);
		livenessTimer = setInterval(inspectLiveness, intervalMs);
		livenessTimer.unref?.();
	}

	/** Stops restart/liveness machinery and terminates only the currently owned child. */
	function stop(stopMessage) {
		stopping = true;
		if (restartTimer) clearTimeout(restartTimer);
		if (livenessTimer) clearInterval(livenessTimer);
		restartTimer = null;
		livenessTimer = null;
		notify(stopMessage);
		repair.clear(Number(child?.pid || 0));
		child?.kill?.("SIGTERM");
		child = null;
	}

	return {
		livenessStatus: () => ({ ...liveness.status(), repair: repair.snapshot() }),
		markRegistered: () => {
			restartCount = 0;
		},
		notify,
		preventRestart: () => {
			stopping = true;
		},
		restartCount: () => restartCount,
		start,
		stop
	};
}

module.exports = {
	boundedRestartDelay: Config.boundedRestartDelay,
	createProcessSupervisor
};
