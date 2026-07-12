// B"H
const childProcess = require('node:child_process');
const Cleanup = require('./processCleanup.js');
const Group = require('./processGroup.js');
const Identity = require('./processIdentity.js');
const Observe = require('./processObserve.js');

/** B"H — The process facade exposes spawn, identity, cleanup, and priority only. */
function spawn(command, cwd, shell, options = {}) {
	return Group.spawn(command, cwd, shell, options);
}

async function identify(spawned = {}) {
	const observed = await Observe.observe(spawned.pid);
	return Identity.create({
		pid: spawned.pid,
		processGroupId: observed.processGroupId || spawned.processGroupId,
		birthToken: observed.birthToken,
		platform: process.platform,
		observedAt: new Date().toISOString()
	});
}

async function cleanup(identity = {}, options = {}) {
	return Cleanup.cleanup(identity, options);
}

function renice(spawned = {}, payload = {}) {
	if (process.platform === 'win32') return false;
	if (payload.priority === 'high' || payload.priority === 'control') return false;
	const pid = Number(spawned.pid || spawned.child?.pid || 0);
	if (!pid) return false;
	try {
		childProcess.spawn('renice', ['10', '-p', String(pid)], {
			stdio: 'ignore',
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
		birthToken: '',
		platform: process.platform
	});
}

module.exports = {
	cleanup,
	identify,
	preliminary,
	renice,
	spawn
};
