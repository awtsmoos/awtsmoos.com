// B"H

const Recover = require("../mission/daemon/recover.js");
const Scheduler = require("../mission/daemon/scheduler.js");
const Status = require("../mission/daemon/status.js");
const Tick = require("../mission/daemon/tick.js");

/**
 * B"H — Each mission receives its own scheduler vessel. Starting is idempotent,
 * stopping drains its timer registry, and status names the actual mission lane.
 */
function buildMissionDaemonActions(context, buildActions) {
	const { config, payload } = context;
	return {
		async missionDaemonStart() {
			const scheduler = Scheduler.start(config, payload, buildActions);
			return {
				...Status.status(config, payload),
				action: "missionDaemonStart",
				started: scheduler.running,
				scheduler
			};
		},
		async missionDaemonStatus() {
			return Status.status(config, payload);
		},
		async missionDaemonTick() {
			return Tick.tick(config, payload, buildActions);
		},
		async missionDaemonRecover() {
			const recovery = Recover.recover(config);
			const shouldResume = payload.resume !== false && payload.resume !== "false";
			const scheduler = recovery.recovered && shouldResume
				? Scheduler.start(config, payload, buildActions)
				: Scheduler.status(config, payload);
			return { ...recovery, scheduler };
		},
		async missionDaemonStop() {
			const scheduler = Scheduler.stop(config, payload);
			return {
				...Status.status(config, payload),
				action: "missionDaemonStop",
				paused: true,
				releaseAllowed: false,
				scheduler
			};
		}
	};
}

module.exports = { buildMissionDaemonActions };
