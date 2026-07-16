// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FinalCutoverOfflineGate
 * @description
 * The Awtsmoos permits renames only when measured process, listener, and descriptor
 * evidence is dark. Awtsmoos.com never substitutes lifecycle intention for truth.
 */

const fs = require('fs');
const { execFileSync } = require('child_process');

function assertOffline(policy, options = {}) {
	const run = options.command || command;
	const alive = options.processAlive || processAlive;
	const livePids = pidFiles(policy)
		.map(file => ({ file, pid: readPid(file) }))
		.filter(record => alive(record.pid));
	if (livePids.length) {
		throw offlineError('managed production PID remains alive', { livePids });
	}
	const listeners = run('/usr/sbin/lsof', [
		'-nP',
		`-iTCP:${policy.port}`,
		'-sTCP:LISTEN'
	]);
	if (listeners.trim()) {
		throw offlineError(`port ${policy.port} still has a listener`, { listeners });
	}
	const handles = run('/usr/sbin/lsof', ['-nP', '+D', policy.dataRoot])
		.split(/\r?\n/)
		.filter(Boolean);
	if (handles.length) {
		throw offlineError('data-root handles remain open', { handles });
	}
	return { ok: true, livePids: [], listeners: [], handles: [] };
}

function pidFiles(policy) {
	const logs = `${policy.repositoryRoot}/.logs`;
	return [
		`${logs}/awtsmoos-production-supervisor.pid`,
		`${logs}/awtsmoos-production-child.pid`,
		`${logs}/awtsmoos-production-rag.pid`
	];
}

function readPid(file) {
	try {
		return Number(fs.readFileSync(file, 'utf8').trim());
	} catch {
		return 0;
	}
}

function processAlive(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function command(file, args) {
	try {
		return execFileSync(file, args, {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 30000,
			maxBuffer: 32 * 1024 * 1024
		});
	} catch (error) {
		if (error.status === 1) return String(error.stdout || '');
		throw error;
	}
}

function offlineError(message, details = {}) {
	return Object.assign(new Error(`B"H final cutover refused: ${message}`), {
		code: 'AWTSMOOS_FINAL_CUTOVER_NOT_OFFLINE',
		...details
	});
}

module.exports = {
	assertOffline,
	command,
	offlineError,
	pidFiles,
	processAlive,
	readPid
};
