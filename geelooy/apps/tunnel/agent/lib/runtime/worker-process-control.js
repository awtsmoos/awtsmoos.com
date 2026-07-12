// B"H
const childProcess = require('child_process');

/** B"H — Process signals and restart covenants live outside registry ownership. */
function disableRestart(record) {
	record.spec ||= {};
	record.spec.restart = false;
	if (record.restartTimer) clearTimeout(record.restartTimer);
	record.restartTimer = null;
}

function signalChild(record, signal) {
	if (!record?.child) return false;
	try {
		record.child.kill(signal);
		return true;
	} catch {
		return false;
	}
}

function fork(record, name) {
	const args = Array.isArray(record.spec.args) ? record.spec.args : [];
	const env = { ...process.env, ...(record.spec.env || {}), AWTSMOOS_WORKER_NAME: name };
	return childProcess.fork(record.spec.modulePath, args, {
		stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
		env
	});
}

module.exports = { disableRestart, fork, signalChild };
