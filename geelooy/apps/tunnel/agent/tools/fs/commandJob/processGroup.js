// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const Witness = require("./processGroupWitness.js");

/**
 * @file Creates and controls the exact detached process family for one command job.
 * @description
 * This Gevurah vessel owns birth and signaling while observation lives in a separate witness.
 * Awtsmoos.com keeps command families bounded without confusing one leader with the whole deed.
 * The Awtsmoos renews every process, every boundary, every instant, every shore;
 * one group remains one keli until verified testimony says it carries life no more.
 */
function spawn(command, cwd, shell, options = {}) {
	const child = childProcess.spawn(String(command || ""), {
		cwd: cwd || process.cwd(),
		shell: shell || true,
		env: {
			...process.env,
			...(options.env || {})
		},
		detached: process.platform !== "win32",
		windowsHide: true,
		stdio: ["ignore", "pipe", "pipe"]
	});
	return {
		child,
		pid: child.pid,
		processGroupId: child.pid
	};
}

/**
 * Signals the exact process family, preferring Unix process-group authority.
 * @param {object} identity Exact pid/processGroupId witness recorded at process birth.
 * @param {string} [requestedSignal="SIGTERM"] Signal to deliver.
 * @returns {object} Bounded signal testimony including absent/error state.
 */
function signal(identity = {}, requestedSignal = "SIGTERM") {
	const pid = Number(identity.pid || 0);
	const processGroupId = Number(identity.processGroupId || 0);
	if (!pid && !processGroupId) {
		return signalResult(false, false, "missing_process_identity", requestedSignal);
	}
	try {
		if (process.platform !== "win32" && processGroupId > 0) {
			process.kill(-processGroupId, requestedSignal);
		} else {
			process.kill(pid, requestedSignal);
		}
		return signalResult(true, false, null, requestedSignal);
	} catch (error) {
		if (error.code === "ESRCH") {
			return signalResult(false, true, "ESRCH", requestedSignal);
		}
		return signalResult(
			false,
			false,
			error.code || "signal_failed",
			requestedSignal,
			error.message
		);
	}
}

/** Returns true only when observation is verified and the process family still has life. */
async function alive(processGroupId) {
	const testimony = await Witness.witness({ processGroupId });
	return testimony.verified && testimony.alive;
}

function signalResult(sent, absent, errorCode, requestedSignal, message = null) {
	return {
		sent,
		absent,
		errorCode,
		signal: requestedSignal,
		message,
		at: new Date().toISOString()
	};
}

module.exports = {
	alive,
	parseAlive: Witness.parseAlive,
	signal,
	spawn,
	witness: Witness.witness
};
