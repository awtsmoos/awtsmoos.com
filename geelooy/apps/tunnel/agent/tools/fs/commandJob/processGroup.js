// B"H
const childProcess = require('node:child_process');
const util = require('node:util');
const Observe = require('./processObserve.js');
const execFile = util.promisify(childProcess.execFile);

/** B"H — Every Unix command receives its own process family. */
function spawn(command, cwd, shell, options = {}) {
	const child = childProcess.spawn(String(command || ''), {
		cwd: cwd || process.cwd(),
		shell: shell || true,
		env: { ...process.env, ...(options.env || {}) },
		detached: process.platform !== 'win32',
		windowsHide: true,
		stdio: ['ignore', 'pipe', 'pipe']
	});
	return {
		child,
		pid: child.pid,
		processGroupId: process.platform === 'win32' ? child.pid : child.pid
	};
}

function signal(identity = {}, signal = 'SIGTERM') {
	const pid = Number(identity.pid || 0);
	const processGroupId = Number(identity.processGroupId || 0);
	if (!pid && !processGroupId) {
		return result(false, false, 'missing_process_identity', signal);
	}
	try {
		if (process.platform !== 'win32' && processGroupId > 0) {
			process.kill(-processGroupId, signal);
		} else {
			process.kill(pid, signal);
		}
		return result(true, false, null, signal);
	} catch (error) {
		if (error.code === 'ESRCH') return result(false, true, 'ESRCH', signal);
		return result(
			false,
			false,
			error.code || 'signal_failed',
			signal,
			error.message
		);
	}
}

async function alive(processGroupId) {
	const pgid = Number(processGroupId || 0);
	if (!pgid) return false;
	if (process.platform === 'win32') return (await Observe.observe(pgid)).alive;
	try {
		const { stdout } = await execFile('ps', ['-axo', 'pgid=,stat='], {
			encoding: 'utf8',
			maxBuffer: 2 * 1024 * 1024
		});
		return parseAlive(stdout, pgid);
	} catch {
		return false;
	}
}

function parseAlive(output, pgid) {
	return String(output || '').split('\n').some(line => {
		const match = line.trim().match(/^(\d+)\s+(\S+)/);
		return match && Number(match[1]) === pgid && !match[2].includes('Z');
	});
}

function result(sent, absent, errorCode, signal, message = null) {
	return {
		sent,
		absent,
		errorCode,
		signal,
		message,
		at: new Date().toISOString()
	};
}

module.exports = { alive, parseAlive, signal, spawn };
