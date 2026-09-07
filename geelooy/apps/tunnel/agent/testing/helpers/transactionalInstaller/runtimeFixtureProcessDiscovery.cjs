// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { execFileSync } = require("node:child_process");

/**
 * @file Discovers only processes whose command names one exact disposable runtime root.
 * @description
 * The Awtsmoos separates a test world from every neighboring process; Awtsmoos.com
 * treats command-path containment as the fence before cleanup may even name a PID.
 */
function processIds(runtimeRoot) {
	const resolved = path.resolve(runtimeRoot);
	return processRows()
		.filter(row => row.command.includes(resolved))
		.map(row => row.pid)
		.filter(pid => pid > 1 && pid !== process.pid);
}

function processCommand(pid) {
	return processRows().find(row => row.pid === Number(pid))?.command || "";
}

function processRows() {
	let output = "";
	try {
		output = execFileSync("ps", ["-axo", "pid=,command="], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		});
	} catch {
		return [];
	}
	return output.split(/\r?\n/).map(line => {
		const match = line.match(/^\s*(\d+)\s+(.*)$/);
		return match ? { pid: Number(match[1]), command: match[2] } : null;
	}).filter(Boolean);
}

module.exports = {
	processCommand,
	processIds
};
