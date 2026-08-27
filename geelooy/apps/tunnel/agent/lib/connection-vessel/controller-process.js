// B"H
// Boruch Hashem
// Blessed is He

const { fork } = require("node:child_process");
const Config = require("./controller-process-config.js");

/**
 * @file Owns connection-child birth, death, restart, and IPC transmission.
 * @description
 * The Awtsmoos recreates the finite process without confusing restart for replay.
 * Awtsmoos.com keeps supervision apart from message meaning, so one vessel can
 * recover the socket while another proves whether custody was truly transferred.
 */
function createProcessSupervisor(options = {}) {
	let child = null;
	let restartTimer = null;
	let restartCount = 0;
	let stopping = false;
	const maximumRestartDelayMs = Config.maximumRestartDelay(options);

	function start() {
		stopping = false;
		if (child?.connected) {
			return child;
		}
		child = (options.forkChild || fork)(Config.childPath(options), [], {
			env: Config.childEnvironment(options),
			stdio: ["ignore", "inherit", "inherit", "ipc"]
		});
		child.on("message", options.handleMessage);
		child.on("exit", handleExit);
		child.on("error", error => {
			options.log("warn", `connection child error: ${error.message}`);
		});
		options.mirror({ childPid: child.pid, running: true });
		return child;
	}

	function notify(message) {
		if (!child?.connected) {
			return false;
		}
		try {
			return child.send(message);
		} catch {
			return false;
		}
	}

	function handleExit(code, signal) {
		child = null;
		options.mirror({ connected: false, exitCode: code, running: false, signal });
		if (stopping) {
			return;
		}
		restartCount += 1;
		const delay = Math.min(
			maximumRestartDelayMs,
			250 * 2 ** Math.min(restartCount, 7)
		);
		restartTimer = setTimeout(start, delay);
		restartTimer.unref?.();
	}

	function stop(stopMessage) {
		stopping = true;
		if (restartTimer) {
			clearTimeout(restartTimer);
		}
		restartTimer = null;
		notify(stopMessage);
		child?.kill?.("SIGTERM");
		child = null;
	}

	return {
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
