// B"H
const childProcess = require("node:child_process");
const util = require("node:util");
const ProcessObserve = require("./processObserve.js");
const execFile = util.promisify(childProcess.execFile);

/** B"H — Each command receives a separate process family on Unix. */
function spawnGroup(input = {}) {
	const child = childProcess.spawn(String(input.command || ""), {
		cwd: input.cwd || process.cwd(),
		shell: input.shell || true,
		env: { ...process.env, ...(input.env || {}) },
		detached: process.platform !== "win32",
		windowsHide: true,
		stdio: ["ignore", "pipe", "pipe"]
	});
	return {
		child,
		pid: child.pid,
		processGroupId: process.platform === "win32" ? child.pid : child.pid
	};
}

function signalGroup(processIdentity = {}, signal = "SIGTERM") {
	const pid = Number(processIdentity.pid || 0);
	const processGroupId = Number(processIdentity.processGroupId || 0);
	if (!pid && !processGroupId) return result(false, false, "missing_process_identity", signal);
	try {
		if (process.platform !== "win32" && processGroupId > 0) process.kill(-processGroupId, signal);
		else process.kill(pid, signal);
		return result(true, false, null, signal);
	} catch (error) {
		if (error.code === "ESRCH") return result(false, true, "ESRCH", signal);
		return result(false, false, error.code || "signal_failed", signal, error.message);
	}
}

function groupAlive(processGroupId) {
	const pgid = Number(processGroupId || 0);
	if (!pgid) return false;
	if (process.platform === "win32") return ProcessObserve.observeProcess(pgid).alive;
	try {
		const output = childProcess.execFileSync("ps", ["-axo", "pgid=,stat="], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		});
		return parseGroup(output, pgid);
	} catch {
		return false;
	}
}

async function groupAliveAsync(processGroupId) {
	const pgid = Number(processGroupId || 0);
	if (!pgid) return false;
	if (process.platform === "win32") return (await ProcessObserve.observeProcessAsync(pgid)).alive;
	try {
		const { stdout } = await execFile("ps", ["-axo", "pgid=,stat="], {
			encoding: "utf8",
			maxBuffer: 2 * 1024 * 1024
		});
		return parseGroup(stdout, pgid);
	} catch {
		return false;
	}
}

function parseGroup(output, pgid) {
	return String(output || "").split("\n").some(line => {
		const match = line.trim().match(/^(\d+)\s+(\S+)/);
		return match && Number(match[1]) === pgid && !match[2].includes("Z");
	});
}

function result(sent, absent, errorCode, signal, message = null) {
	return { sent, absent, errorCode, signal, message, at: new Date().toISOString() };
}

module.exports = { groupAlive, groupAliveAsync, signalGroup, spawnGroup };
