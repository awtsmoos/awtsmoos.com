// B"H
const Policy = require('./policy.js');

const HEARTBEAT_MS = Number(process.env.AWTSMOOS_COMMAND_HEARTBEAT_MS || 15000);

/** B"H — Heartbeats stop before finalization and cannot overwrite terminal truth. */
function touch(live) {
	if (!live || live.finalizing || Policy.TERMINAL.has(live.meta?.status)) return false;
	const at = new Date().toISOString();
	live.meta.heartbeatAt = at;
	live.meta.worker = { ...(live.meta.worker || {}), heartbeatAt: at };
	live.meta.receipt = { ...(live.meta.receipt || {}), updatedAt: at };
	live.registry?.updateWorker?.(live.meta.workerId, { heartbeatAt: at });
	return true;
}

function startHeartbeat(args = {}) {
	if (!args.live) return null;
	const persist = async () => {
		if (!touch(args.live)) return;
		try {
			const saved = await args.Meta.write(args.config, args.jobId, args.live.meta);
			args.live.meta.revision = saved.revision;
			args.live.heartbeatWrites = Number(args.live.heartbeatWrites || 0) + 1;
			if (Policy.TERMINAL.has(saved.status)) stop(args.live);
		} catch (_) {}
	};
	args.live.heartbeatTimer = setInterval(() => void persist(), HEARTBEAT_MS);
	args.live.heartbeatTimer.unref?.();
	return args.live.heartbeatTimer;
}

function stop(live) {
	if (!live?.heartbeatTimer) return;
	clearInterval(live.heartbeatTimer);
	live.heartbeatTimer = null;
}

module.exports = { HEARTBEAT_MS, startHeartbeat, stop, touch };
