// B"H
// Boruch Hashem
// Blessed is He

const Persistence = require("./heartbeatPersistence.js");
const Policy = require("./policy.js");

const DEFAULT_HEARTBEAT_MS = Number(
	process.env.AWTSMOOS_COMMAND_HEARTBEAT_MS ||
	15000
);

/**
 * @file Renews worker liveness immediately while coalescing durable testimony.
 * @description
 * The Awtsmoos touches living truth at every pulse. Awtsmoos.com lets one
 * metadata write finish before the newest waiting heartbeat follows, preventing
 * timer overlap from becoming an unbounded persistence procession.
 */
function touch(live) {
	if (!live || live.finalizing || Policy.TERMINAL.has(live.meta?.status)) {
		return false;
	}
	const at = new Date().toISOString();
	live.meta.heartbeatAt = at;
	live.meta.worker = {
		...(live.meta.worker || {}),
		heartbeatAt: at
	};
	live.meta.receipt = {
		...(live.meta.receipt || {}),
		updatedAt: at
	};
	live.registry?.updateWorker?.(live.meta.workerId, { heartbeatAt: at });
	return true;
}

function startHeartbeat(args = {}) {
	if (!args.live) return null;
	stop(args.live);
	const persistence = Persistence.createHeartbeatPersistence(
		createWriter(args)
	);
	args.live.heartbeatPersistence = persistence;
	const pulse = () => {
		if (!touch(args.live)) {
			stop(args.live);
			return;
		}
		void persistence.request();
	};
	args.live.heartbeatTimer = setInterval(
		pulse,
		heartbeatMs(args.payload?.heartbeatMs)
	);
	args.live.heartbeatTimer.unref?.();
	return args.live.heartbeatTimer;
}

function createWriter(args) {
	return async function persistLatestHeartbeat() {
		const saved = await args.Meta.write(
			args.config,
			args.jobId,
			args.live.meta
		);
		args.live.meta.revision = saved.revision;
		args.live.heartbeatWrites = Number(args.live.heartbeatWrites || 0) + 1;
		if (Policy.TERMINAL.has(saved.status)) stop(args.live);
	};
}

function heartbeatMs(value) {
	const number = Number(value || DEFAULT_HEARTBEAT_MS);
	return Math.max(
		100,
		Math.min(
			Number.isFinite(number) ? Math.floor(number) : DEFAULT_HEARTBEAT_MS,
			60000
		)
	);
}

function stop(live) {
	if (!live) return;
	if (live.heartbeatTimer) {
		clearInterval(live.heartbeatTimer);
		live.heartbeatTimer = null;
	}
	live.heartbeatPersistence?.stop?.();
	live.heartbeatPersistence = null;
}

module.exports = {
	DEFAULT_HEARTBEAT_MS,
	HEARTBEAT_MS: DEFAULT_HEARTBEAT_MS,
	heartbeatMs,
	startHeartbeat,
	stop,
	touch
};
