#!/usr/bin/env node
// B"H

const { loadConfig } = require("../lib/config.js");
const { ROOT } = require("../lib/config.js");
const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const command = String(process.argv[2] || "status").toLowerCase();
const config = loadConfig();
if (command === "status") {
	console.log(JSON.stringify(DeviceIdentity.publicStatus(config), null, 2));
} else if (["forget", "logout", "delete"].includes(command)) {
	const stopped = stopRuntime();
	console.log(JSON.stringify({ ...DeviceIdentity.forget(config), stopped }, null, 2));
} else {
	console.error("Usage: device-identity.cjs status|forget");
	process.exitCode = 2;
}

/** Stops only processes whose command line proves they belong to this install root. */
function stopRuntime() {
	const stopped = [];
	for (const name of ["supervisor.pid", "agent.pid"]) {
		const pid = Number(read(path.join(ROOT, name)));
		if (!Number.isInteger(pid) || pid < 2 || !ownsInstallRoot(pid)) continue;
		try {
			process.kill(pid, "SIGTERM");
			stopped.push({ name, pid });
		} catch {}
	}
	return stopped;
}

function ownsInstallRoot(pid) {
	const result = spawnSync("/bin/ps", ["-p", String(pid), "-o", "command="], {
		encoding: "utf8",
		timeout: 2000
	});
	return result.status === 0 && String(result.stdout || "").includes(ROOT);
}

function read(file) {
	try { return fs.readFileSync(file, "utf8").trim(); }
	catch { return ""; }
}
