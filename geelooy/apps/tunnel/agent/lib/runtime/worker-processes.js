// B"H
const { publicProcess } = require('./worker-public.js');
const Control = require('./worker-process-control.js');

/**
 * B"H — Named helper vessels restart only while their covenant permits it.
 * Shutdown clears every timer before signaling children, so no dead agent can
 * resurrect a helper after the process has begun yielding ownership.
 */
function createProcessSupervisor(options = {}) {
	const processes = new Map();
	const log = typeof options.log === 'function' ? options.log : () => {};

	function define(name, spec = {}) {
		const current = processes.get(name) || {
			name,
			restartCount: 0,
			status: 'defined'
		};
		processes.set(name, { ...current, spec: { ...spec }, name });
		return processes.get(name);
	}

	function start(name) {
		const record = processes.get(name);
		if (!record) throw new Error(`unknown_worker:${name}`);
		if (record.child && !record.child.killed) return record;
		const child = Control.fork(record, name);
		Object.assign(record, {
			child,
			pid: child.pid,
			status: 'running',
			startedAt: Date.now(),
			lastSeenAt: Date.now()
		});
		child.on('message', message => {
			record.lastSeenAt = Date.now();
			record.lastMessage = message;
		});
		child.on('exit', (code, signal) => onExit(name, record, code, signal));
		child.on('error', error => {
			record.status = 'error';
			record.error = error.message;
			log('worker error', name, error.message);
		});
		return record;
	}

	function stop(name, signal = 'SIGTERM') {
		const record = processes.get(name);
		if (!record) return null;
		Control.disableRestart(record);
		Control.signalChild(record, signal);
		return record;
	}

	function stopAll(signal = 'SIGTERM') {
		const stopped = [];
		for (const [name, record] of processes) {
			Control.disableRestart(record);
			if (Control.signalChild(record, signal)) stopped.push(name);
		}
		return { ok: true, signal, stopped };
	}

	function snapshot() {
		return Object.fromEntries(
			[...processes].map(([name, record]) => [name, publicProcess(record)])
		);
	}

	function onExit(name, record, code, signal) {
		Object.assign(record, {
			status: 'exited',
			exitCode: code,
			signal,
			exitedAt: Date.now(),
			child: null
		});
		if (record.spec.restart !== false) scheduleRestart(name, record);
	}

	function scheduleRestart(name, record) {
		if (record.restartTimer) return;
		record.restartCount = Number(record.restartCount || 0) + 1;
		const delay = Math.min(30000, 500 * record.restartCount);
		record.restartTimer = setTimeout(() => restart(name, record), delay);
		record.restartTimer.unref?.();
	}

	function restart(name, record) {
		record.restartTimer = null;
		try { start(name); }
		catch (error) { log('worker restart failed', name, error.message); }
	}

	return { define, snapshot, start, stop, stopAll };
}

module.exports = { createProcessSupervisor };
