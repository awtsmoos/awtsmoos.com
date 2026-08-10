// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const Cleanup = require("./processCleanup.js");
const Group = require("./processGroup.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");

/**
 * @file Exposes process spawn, exact identity, guarded cleanup, and priority control.
 * @description
 * The Awtsmoos lets a PID be an address but never a proof of birth;
 * Awtsmoos.com rejects uncertain observation, so cleanup cannot mistake hidden life for missing earth.
 */
function spawn(command, cwd, shell, options = {}) {
	return Group.spawn(command, cwd, shell, options);
}

/** Returns exact birth identity or throws an explicitly unverified observation error. */
async function identify(spawned = {}) {
	const observed = await Observe.observe(spawned.pid);
	assertObservable(observed);
	return Identity.create({
		pid: spawned.pid,
		processGroupId: observed.processGroupId || spawned.processGroupId,
		birthToken: observed.birthToken,
		platform: process.platform,
		observedAt: new Date().toISOString()
	});
}

function assertObservable(observed = {}) {
	if (observed.alive === true && observed.birthToken) return true;
	const error = new Error(`process_identity_unavailable:${observed.state || "unknown"}`);
	error.code = "process_identity_unavailable";
	error.observationState = observed.state || "unknown";
	error.processAlive = observed.alive;
	throw error;
}

async function cleanup(identity = {}, options = {}) {
	return Cleanup.cleanup(identity, options);
}

function renice(spawned = {}, payload = {}) {
	if (process.platform === "win32") return false;
	if (payload.priority === "high" || payload.priority === "control") return false;
	const pid = Number(spawned.pid || spawned.child?.pid || 0);
	if (!pid) return false;
	try {
		childProcess.spawn("renice", ["10", "-p", String(pid)], {
			stdio: "ignore",
			detached: true
		}).unref();
		return true;
	} catch {
		return false;
	}
}

function preliminary(spawned = {}) {
	return Identity.create({
		pid: spawned.pid,
		processGroupId: spawned.processGroupId,
		birthToken: "",
		platform: process.platform
	});
}

module.exports = {
	assertObservable,
	cleanup,
	identify,
	preliminary,
	renice,
	spawn
};
