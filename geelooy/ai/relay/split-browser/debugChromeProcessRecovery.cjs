//B"H
//Boruch Hashem
//Blessed be He

const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const Registry = require("./deviceBrowserRegistry.cjs");

const executeFile = promisify(execFile);

/**
 * @file Terminates only the selected main Chrome owner for the requested endpoint.
 * @description
 * Recovery requires profile identity and, when supplied, the exact debug port/PID.
 * Renderer children and unrelated browsers sharing the same numeric port are never
 * considered ownership evidence and therefore remain untouched.
 */
async function closeStaleDebugProcesses(port, options = {}) {
	const profile = options.profile || Registry.selectedProfile();
	const processes = await listProcesses();
	const matches = processes.filter(item => isOwnedDebugProcess(
		item,
		profile,
		options.pid,
		port
	));
	for (const processInfo of matches) {
		await terminateProcess(processInfo.pid);
	}
	return {
		ok: true,
		closed: matches.length,
		pids: matches.map(item => item.pid),
		requestedPort: Number(port || 0) || null
	};
}
/** Returns true only for the selected main browser process at the requested endpoint. */
function isOwnedDebugProcess(processInfo, profile, expectedPid, expectedPort) {
	if (!processInfo?.command || !profile) return false;
	if (expectedPid && processInfo.pid !== Number(expectedPid)) return false;
	if (/(?:^|\s)--type=/.test(processInfo.command)) return false;
	if (!processInfo.command.includes(`--user-data-dir=${profile}`)) return false;
	const match = processInfo.command.match(/--remote-debugging-port(?:=|\s+)(\d+)/);
	if (!match) return false;
	const actualPort = Number(match[1]);
	const requestedPort = Number(expectedPort || 0);
	if (expectedPid && actualPort === 0) return true;
	return !requestedPort || actualPort === requestedPort;
}

/** Lists local processes without reading browser content or credentials. */
async function listProcesses() {
	if (process.platform === "win32") return [];
	const { stdout } = await executeFile("ps", ["-axo", "pid=,command="]);
	return stdout
		.split("\n")
		.map(line => line.trim())
		.filter(Boolean)
		.map(parseProcessLine)
		.filter(Boolean);
}

function parseProcessLine(line) {
	const match = line.match(/^(\d+)\s+(.+)$/);
	return match ? { pid: Number(match[1]), command: match[2] } : null;
}
async function terminateProcess(pid) {
	try {
		process.kill(pid, "SIGTERM");
	} catch (error) {
		if (error?.code !== "ESRCH") throw error;
	}
}

module.exports = {
	closeStaleDebugProcesses,
	isOwnedDebugProcess,
	listProcesses
};
