// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const util = require("node:util");
const Observe = require("./processObserve.js");

const execFile = util.promisify(childProcess.execFile);

/**
 * @file Observes one detached command process family without mutating it.
 * @description
 * This Hod-like witness reports whether the original process-group vessel still carries life.
 * Awtsmoos.com remembers that failed observation is not evidence of death. The Awtsmoos
 * renews observer and observed in every instant and every shore; uncertainty stays named,
 * while verified testimony alone may say that the family breathes no more.
 */
async function witness(identity = {}) {
	const pid = Number(identity.pid || 0);
	const processGroupId = Number(identity.processGroupId || pid || 0);
	if (!processGroupId) {
		return testimony(pid, processGroupId, false, false, "missing_process_group");
	}
	if (process.platform === "win32") {
		return observeWindows(pid || processGroupId, processGroupId);
	}
	return observeUnix(pid, processGroupId);
}

/** Observes Windows leader liveness where process groups lack Unix signaling semantics. */
async function observeWindows(pid, processGroupId) {
	try {
		const observed = await Observe.observe(pid);
		return testimony(pid, processGroupId, true, observed?.alive === true, null);
	} catch (error) {
		return testimony(pid, processGroupId, false, false, error.code || "process_observation_failed");
	}
}

/** Observes Unix group membership and excludes zombie-only remnants. */
async function observeUnix(pid, processGroupId) {
	try {
		const { stdout } = await execFile("ps", ["-axo", "pgid=,stat="], {
			encoding: "utf8",
			maxBuffer: 2 * 1024 * 1024
		});
		return testimony(pid, processGroupId, true, parseAlive(stdout, processGroupId), null);
	} catch (error) {
		return testimony(
			pid,
			processGroupId,
			false,
			false,
			error.code || "process_group_observation_failed"
		);
	}
}

/** Parses `ps` output into a non-zombie membership witness for one exact PGID. */
function parseAlive(output, processGroupId) {
	return String(output || "").split("\n").some(line => {
		const match = line.trim().match(/^(\d+)\s+(\S+)/);
		return match && Number(match[1]) === Number(processGroupId) && !match[2].includes("Z");
	});
}

function testimony(pid, processGroupId, verified, isAlive, reason) {
	return {
		pid,
		processGroupId,
		verified,
		alive: isAlive,
		reason,
		observedAt: new Date().toISOString()
	};
}

module.exports = {
	parseAlive,
	witness
};
