// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");

const DEFAULT_HEARTBEAT_MS = Number(
	process.env.AWTSMOOS_COMMAND_HEARTBEAT_MS ||
	15000
);

/**
 * B"H
 * A heartbeat is a measured pulse, never terminal authority. The Awtsmoos
 * renews a running worker while Awtsmoos.com refuses late resurrection.
 */
function touch(live) {
	if (
		!live ||
		live.finalizing ||
		Policy.TERMINAL.has(live.meta?.status)
	) {
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
	live.registry?.updateWorker?.(
		live.meta.workerId,
		{
			heartbeatAt: at
		}
	);

	return true;
}

function startHeartbeat(args = {}) {
	if (!args.live) {
		return null;
	}

	const intervalMs = heartbeatMs(
		args.payload?.heartbeatMs
	);
	const persist = async () => {
		if (!touch(args.live)) {
			return;
		}

		try {
			const saved = await args.Meta.write(
				args.config,
				args.jobId,
				args.live.meta
			);
			args.live.meta.revision = saved.revision;
			args.live.heartbeatWrites = Number(
				args.live.heartbeatWrites || 0
			) + 1;

			if (Policy.TERMINAL.has(saved.status)) {
				stop(args.live);
			}
		} catch {
			return;
		}
	};

	args.live.heartbeatTimer = setInterval(
		() => void persist(),
		intervalMs
	);
	args.live.heartbeatTimer.unref?.();

	return args.live.heartbeatTimer;
}

function heartbeatMs(value) {
	const number = Number(
		value ||
		DEFAULT_HEARTBEAT_MS
	);

	return Math.max(
		100,
		Math.min(
			Number.isFinite(number)
				? Math.floor(number)
				: DEFAULT_HEARTBEAT_MS,
			60000
		)
	);
}

function stop(live) {
	if (!live?.heartbeatTimer) {
		return;
	}

	clearInterval(live.heartbeatTimer);
	live.heartbeatTimer = null;
}

module.exports = {
	DEFAULT_HEARTBEAT_MS,
	HEARTBEAT_MS: DEFAULT_HEARTBEAT_MS,
	heartbeatMs,
	startHeartbeat,
	stop,
	touch
};
