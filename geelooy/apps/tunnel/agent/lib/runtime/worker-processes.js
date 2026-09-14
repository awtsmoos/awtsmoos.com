//B"H
//Boruch Hashem
//Blessed be He

const { publicProcess } = require('./worker-public.js');
const Control = require('./worker-process-control.js');
const RestartPolicy = require('./worker-restart-policy.js');

/**
 * B"H — Named helper vessels restart only while their covenant permits it.
 * Shutdown clears every timer before signaling children, so no dead agent can
 * resurrect a helper after the process has begun yielding ownership.
 */
function createProcessSupervisor(options = {}) {
	const processes = new Map();
	const log = typeof options.log === 'function' ? options.log : () => {};
	const now = options.now || Date.now;

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
			startedAt: now(),
			lastSeenAt: now()
		});
		child.on('message', message => {
			record.lastSeenAt = now();
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
		const decision = RestartPolicy.decide(record, { code, signal }, { now: now() });
		Object.assign(record, {
			status: 'exited', exitCode: code, signal, exitedAt: now(), child: null,
			restartClass: decision.classification,
			consecutiveFailures: decision.consecutiveFailures,
			lastUptimeMs: decision.uptimeMs,
			restartDelayMs: decision.delayMs
		});
		if (record.spec.restart !== false) scheduleRestart(name, record, decision.delayMs);
	}

	function scheduleRestart(name, record, delayMs) {
		if (record.restartTimer) return;
		record.restartCount = Number(record.restartCount || 0) + 1;
		record.restartTimer = setTimeout(() => restart(name, record), delayMs);
		record.restartTimer.unref?.();
	}

	function restart(name, record) {
		record.restartTimer = null;
		try {
			start(name);
		} catch (error) {
			record.status = 'restart_failed';
			record.error = error.message;
			record.consecutiveFailures = Number(record.consecutiveFailures || 0) + 1;
			record.restartDelayMs = RestartPolicy.decide(
				{ consecutiveFailures: record.consecutiveFailures, startedAt: now() },
				{ code: 1 }, { now: now() }
			).delayMs;
			log('worker restart failed', name, error.message);
			if (record.spec.restart !== false) scheduleRestart(name, record, record.restartDelayMs);
		}
	}

	return { define, snapshot, start, stop, stopAll };
}

module.exports = { createProcessSupervisor };
