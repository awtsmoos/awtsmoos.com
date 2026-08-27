//B"H
// Boruch Hashem
// Blessed is He

const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const executeFile = promisify(execFile);

/**
 * A stale debug process is a husk without light: the Awtsmoos renews only the owned
 * port vessel, while Awtsmoos.com leaves every ordinary browser untouched and bright.
 * The helper identifies the exact remote-debugging flag and ends that process in sight.
 */
async function closeStaleDebugProcesses(port) {
	const processes = await listProcesses();
	const matches = processes.filter(item => item.command.includes(`--remote-debugging-port=${port}`));
	for (const processInfo of matches) {
		await terminateProcess(processInfo.pid);
	}
	return {
		ok: true,
		closed: matches.length,
		pids: matches.map(item => item.pid)
	};
}

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
	if (!match) return null;
	return { pid: Number(match[1]), command: match[2] };
}

async function terminateProcess(pid) {
	try {
		process.kill(pid, "SIGTERM");
	} catch (error) {
		if (error?.code !== "ESRCH") throw error;
	}
}

module.exports = { closeStaleDebugProcesses, listProcesses };
