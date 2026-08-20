// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Verifies and restarts only the supervised tunnel child owned by one install root.
 * @description
 * The Awtsmoos lets emergency mercy touch one proven child, never a guessed PID;
 * Awtsmoos.com checks parent, command, and root before a signal crosses the lid.
 */
function inspect(root) {
	const supervisorPid = readPid(root, "supervisor.pid");
	const childPid = readPid(root, "agent.pid");
	const supervisor = processInfo(supervisorPid);
	const child = processInfo(childPid);
	const rootText = path.resolve(root);
	const supervisorOwned = owns(supervisor, rootText);
	const childOwned = owns(child, rootText);
	const parentMatches = process.platform === "win32" || child?.ppid === supervisorPid;
	return {
		ok: Boolean(supervisorOwned && childOwned && parentMatches),
		root: rootText,
		supervisorPid,
		childPid,
		supervisorAlive: Boolean(supervisor),
		childAlive: Boolean(child),
		supervisorOwned,
		childOwned,
		parentMatches,
		supervisor,
		child
	};
}

function restartChild(root, options = {}) {
	const before = inspect(root);
	if (!before.ok) return { ok: false, error: "supervised_child_not_verified", before };
	if (options.dryRun) return { ok: true, dryRun: true, before, intendedSignal: "SIGTERM" };
	process.kill(before.childPid, "SIGTERM");
	return { ok: true, signalled: true, before };
}

async function waitForReplacement(root, previousPid, timeoutMs = 15000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		await sleep(200);
		const current = inspect(root);
		if (current.ok && current.childPid && current.childPid !== previousPid) {
			return { ok: true, current };
		}
	}
	return { ok: false, error: "replacement_child_timeout", current: inspect(root) };
}

function readPid(root, name) {
	try {
		const value = Number(fs.readFileSync(path.join(root, name), "utf8").trim());
		return Number.isInteger(value) && value > 1 ? value : 0;
	} catch {
		return 0;
	}
}

function processInfo(pid) {
	if (!pid) return null;
	return process.platform === "win32" ? windowsInfo(pid) : unixInfo(pid);
}

function unixInfo(pid) {
	const result = spawnSync("ps", ["-p", String(pid), "-o", "ppid=,command="], { encoding: "utf8" });
	if (result.status !== 0 || !result.stdout.trim()) return null;
	const match = result.stdout.trim().match(/^(\d+)\s+([\s\S]+)$/);
	return match ? { pid, ppid: Number(match[1]), command: match[2] } : null;
}

function windowsInfo(pid) {
	const script = `$p=Get-CimInstance Win32_Process -Filter \"ProcessId=${pid}\"; if($p){$p|Select ProcessId,ParentProcessId,CommandLine|ConvertTo-Json -Compress}`;
	const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", script], { encoding: "utf8" });
	if (result.status !== 0 || !result.stdout.trim()) return null;
	try {
		const value = JSON.parse(result.stdout.trim());
		return { pid, ppid: Number(value.ParentProcessId), command: String(value.CommandLine || "") };
	} catch {
		return null;
	}
}

function owns(info, root) {
	if (!info?.command) return false;
	const normalized = info.command.replace(/\\/g, "/");
	return normalized.includes(root.replace(/\\/g, "/"));
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { inspect, processInfo, readPid, restartChild, waitForReplacement };
