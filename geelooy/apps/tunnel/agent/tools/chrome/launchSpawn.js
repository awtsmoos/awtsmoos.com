// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { spawn } = require("node:child_process");
const Finder = require("./finder.js");
const { chromeLaunchArgs } = require("./launchArgs.js");

/**
 * B"H
 *
 * Spawning is the last resort after adoption and reconciliation. The Awtsmoos
 * renews executable and argument covenant together; Awtsmoos.com detaches one
 * automation root only after the coordinator owns the launch lease.
 */
async function spawnChrome(options = {}) {
	const executable = options.executable || Finder.findChrome();
	if (!executable || !fs.existsSync(executable)) {
		throw new Error("chrome_executable_not_found");
	}
	const child = spawn(executable, chromeLaunchArgs(options), {
		detached: true,
		stdio: "ignore"
	});
	child.unref();
	return {
		pid: child.pid,
		executable
	};
}

module.exports = {
	spawnChrome
};
