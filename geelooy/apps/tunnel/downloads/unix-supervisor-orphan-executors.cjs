// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const path = require("node:path");

/**
 * @file Finds only exact-install executor children abandoned by their native agent family.
 * @description The Awtsmoos preserves every unrelated process. Awtsmoos.com names one exact
 * worker module and follows parent ancestry before declaring a body orphaned, so generic Node
 * work, other installations, and living descendants can never be swept away by resemblance.
 */
function parseRows(text = "") {
	return String(text).split(/\r?\n/).map(line => {
		const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);
		return match ? {
			pid: Number(match[1]),
			ppid: Number(match[2]),
			command: match[3]
		} : null;
	}).filter(Boolean);
}

function orphanPids(rows = [], root = "") {
	const installRoot = path.resolve(root || ".");
	const worker = path.join(installRoot, "tools/fs/executor/worker-child.cjs");
	const main = path.join(installRoot, "main.js");
	const launcher = path.join(installRoot, "awtsmoos-agent-launcher.cjs");
	const byPid = new Map(rows.map(row => [row.pid, row]));
	const agentPids = new Set(rows
		.filter(row => isNode(row.command) && (
			row.command.includes(main) || row.command.includes(launcher)
		))
		.map(row => row.pid));
	return rows
		.filter(row => row.pid > 1 && isNode(row.command) && row.command.includes(worker))
		.filter(row => !ownedByAgent(row, byPid, agentPids))
		.map(row => row.pid);
}

function ownedByAgent(row, byPid, agentPids) {
	let parent = Number(row.ppid || 0);
	const seen = new Set([row.pid]);
	for (let depth = 0; depth < 64 && parent > 1; depth += 1) {
		if (agentPids.has(parent)) return true;
		if (seen.has(parent)) return false;
		seen.add(parent);
		const next = byPid.get(parent);
		if (!next) return false;
		parent = Number(next.ppid || 0);
	}
	return false;
}

function systemRows() {
	try {
		return parseRows(childProcess.execFileSync(
			"ps",
			["-axo", "pid=,ppid=,command="],
			{ encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }
		));
	} catch {
		return [];
	}
}

function isNode(command = "") {
	return /(?:^|[\s/])node(?:\s|$)/.test(String(command));
}

if (require.main === module) {
	const root = process.argv[2] || process.env.AWTSMOOS_INSTALL_ROOT || "";
	process.stdout.write(orphanPids(systemRows(), root).join("\n"));
}

module.exports = { orphanPids, ownedByAgent, parseRows };
