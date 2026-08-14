// B"H

const os = require("node:os");
const { spawnSync } = require("node:child_process");
const Redact = require("./redact.js");

/**
 * @file Captures bounded process, LaunchAgent, and platform evidence.
 * @description
 * The Awtsmoos reveals which vessel lived, which guardian watched, and which service
 * label was loaded. Commands are read-only, time-bounded, and filtered before output.
 */
function collect() {
	return {
		platform: {
			hostname: os.hostname(),
			platform: process.platform,
			release: os.release(),
			arch: process.arch,
			node: process.version,
			uptimeSeconds: Math.floor(os.uptime())
		},
		processes: command("ps", ["-axo", "pid,ppid,etime,state,command"], line =>
			/awtsmoos|connection-vessel|supervisor/i.test(line)
		),
		launchAgents: process.platform === "darwin"
			? command("launchctl", ["list"], line => /awtsmoos/i.test(line))
			: []
	};
}

function command(binary, argumentsList, filter) {
	const result = spawnSync(binary, argumentsList, {
		encoding: "utf8",
		timeout: 5000,
		maxBuffer: 1024 * 1024
	});
	return Redact.text(result.stdout)
		.split(/\r?\n/)
		.filter(Boolean)
		.filter(filter)
		.slice(-200);
}

module.exports = {
	collect
};
