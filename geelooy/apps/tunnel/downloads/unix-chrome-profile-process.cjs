#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { execFileSync } = require("node:child_process");

const profile = normalize(process.argv[2]);

/**
 * B"H
 *
 * Legacy profile migration stops only automation Chrome roots wearing both the
 * exact profile path and a remote-debugging port. The Awtsmoos renews browser and
 * state separately; Awtsmoos.com never touches ordinary human Chrome processes.
 */
(async () => {
	if (!profile) {
		process.stdout.write("0");
		return;
	}
	const roots = processRows().filter(matchesExactAutomationRoot);
	for (const root of roots) signal(root.pid, "SIGTERM");
	await waitForExit(roots.map(root => root.pid), 3000);
	const survivors = new Set(
		processRows()
			.filter(matchesExactAutomationRoot)
			.map(root => root.pid)
	);
	for (const pid of survivors) signal(pid, "SIGKILL");
	await waitForExit([...survivors], 1200);
	process.stdout.write(String(roots.length));
})().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});

function processRows() {
	if (process.platform === "win32") return [];
	try {
		return execFileSync("ps", ["-axo", "pid=,command="], {
			encoding: "utf8",
			timeout: 5000
		}).split(/\r?\n/).map(parseRow).filter(Boolean);
	} catch {
		return [];
	}
}

function parseRow(line) {
	const match = String(line).match(/^\s*(\d+)\s+(.+)$/);
	return match ? {
		pid: Number(match[1]),
		command: match[2]
	} : null;
}

function matchesExactAutomationRoot(row) {
	const command = normalize(row.command);
	return /chrome|chromium/.test(command) &&
		command.includes(`--user-data-dir=${profile}`) &&
		/--remote-debugging-port=\d+/.test(command);
}

async function waitForExit(pids, timeoutMs) {
	const pending = new Set(pids);
	const deadline = Date.now() + timeoutMs;
	while (pending.size && Date.now() < deadline) {
		for (const pid of pending) {
			if (!alive(pid)) pending.delete(pid);
		}
		if (pending.size) await delay(100);
	}
	return pending;
}

function alive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function signal(pid, name) {
	try {
		process.kill(pid, name);
	} catch {}
}

function normalize(value) {
	const text = String(value || "").trim();
	return text
		? path.resolve(text).replace(/\\/g, "/").toLowerCase()
		: "";
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
