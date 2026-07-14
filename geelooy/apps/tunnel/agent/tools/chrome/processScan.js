// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { execFileSync } = require("node:child_process");

/**
 * B"H
 *
 * Process scanning is read-only testimony. The Awtsmoos renews command line,
 * parent, listener, profile, and port together; Awtsmoos.com identifies exact
 * automation roots without confusing them with a human's normal Chrome browser.
 */
function exactDebugRoots(options = {}) {
	return processRows().filter(row => matchesDebugRoot(row, options));
}

function matchesDebugRoot(row = {}, options = {}) {
	const portToken = `--remote-debugging-port=${Number(options.port || 9222)}`;
	const profileToken = `--user-data-dir=${path.resolve(options.userDataDir || "")}`;
	const command = String(row.command || "");
	return /chrome|chromium/i.test(command) &&
		command.includes(portToken) &&
		normalizedCommand(command).includes(normalizedCommand(profileToken));
}

function listenerPids(port) {
	return process.platform === "win32"
		? windowsListenerPids(port)
		: unixListenerPids(port);
}

function processRows() {
	return process.platform === "win32"
		? windowsProcessRows()
		: unixProcessRows();
}

function unixProcessRows() {
	try {
		return execFileSync("ps", ["-axo", "pid=,ppid=,command="], {
			encoding: "utf8",
			timeout: 5000
		}).split(/\r?\n/).map(parseUnixRow).filter(Boolean);
	} catch {
		return [];
	}
}

function unixListenerPids(port) {
	try {
		const output = execFileSync("lsof", [
			"-nP",
			"-t",
			`-iTCP:${Number(port)}`,
			"-sTCP:LISTEN"
		], {
			encoding: "utf8",
			timeout: 3000
		});
		return uniquePids(output.split(/\s+/));
	} catch {
		return [];
	}
}

function windowsProcessRows() {
	try {
		const output = execFileSync("powershell", [
			"-NoProfile",
			"-Command",
			"Get-CimInstance Win32_Process | Select ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"
		], {
			encoding: "utf8",
			timeout: 7000
		});
		const values = JSON.parse(output || "[]");
		return (Array.isArray(values) ? values : [values]).map(value => ({
			pid: Number(value.ProcessId),
			ppid: Number(value.ParentProcessId),
			command: String(value.CommandLine || "")
		}));
	} catch {
		return [];
	}
}

function windowsListenerPids(port) {
	try {
		const output = execFileSync("netstat", ["-ano", "-p", "tcp"], {
			encoding: "utf8",
			timeout: 5000
		});
		return uniquePids(output.split(/\r?\n/)
			.filter(line => line.includes(`:${Number(port)}`) && /LISTENING/i.test(line))
			.map(line => line.trim().split(/\s+/).at(-1)));
	} catch {
		return [];
	}
}

function parseUnixRow(line) {
	const match = String(line).match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);
	return match ? {
		pid: Number(match[1]),
		ppid: Number(match[2]),
		command: match[3]
	} : null;
}

function uniquePids(values) {
	return [...new Set(values.map(Number).filter(value => Number.isInteger(value) && value > 0))];
}

function normalizedCommand(value) {
	return String(value || "").replace(/\\/g, "/").toLowerCase();
}

module.exports = {
	exactDebugRoots,
	listenerPids,
	matchesDebugRoot,
	normalizedCommand,
	processRows
};
