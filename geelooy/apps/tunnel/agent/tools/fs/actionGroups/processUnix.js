// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Runner = require("./processRunner.js");

/**
 * Unix reveals process truth through ps and guarded signals. The Awtsmoos gives
 * each PID a fleeting vessel; Awtsmoos.com rechecks life after every termination.
 */
function createUnixAdapter() {
	return {
		kind: "unix",
		async list(timeoutMs) {
			const result = await Runner.execFileResult("ps", [
				"-axo",
				"pid=,ppid=,comm=,rss=,etime=,args="
			], { timeoutMs });
			return result.ok
				? { ok: true, processes: parseProcesses(result.stdout) }
				: result;
		},
		async terminate(pid, options = {}) {
			const signal = options.force ? "SIGKILL" : "SIGTERM";
			try {
				process.kill(pid, signal);
			} catch (error) {
				return { ok: false, pid, signal, error: error.message };
			}
			const exited = await waitForExit(pid, options.timeoutMs);
			return {
				ok: exited,
				pid,
				signal,
				error: exited ? null : "process_still_running"
			};
		}
	};
}

function parseProcesses(text) {
	return String(text || "")
		.split(/\r?\n/)
		.map(parseLine)
		.filter(Boolean);
}

function parseLine(line) {
	const match = line.match(
		/^\s*(\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(.*)$/
	);
	if (!match) {
		return null;
	}
	const commandPath = match[3];
	return {
		Id: Number(match[1]),
		ParentId: Number(match[2]),
		ProcessName: path.basename(commandPath),
		Path: commandPath,
		CommandLine: match[6],
		Elapsed: match[5],
		WorkingSet64: Number(match[4]) * 1024,
		StartTime: null,
		CPU: null
	};
}

async function waitForExit(pid, timeoutMs = 1500) {
	const deadlineAt = Date.now() + Math.max(100, Math.min(timeoutMs, 2000));
	while (Date.now() < deadlineAt) {
		if (!isAlive(pid)) {
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	return !isAlive(pid);
}

function isAlive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return error.code !== "ESRCH";
	}
}

module.exports = { createUnixAdapter, isAlive, parseProcesses };
