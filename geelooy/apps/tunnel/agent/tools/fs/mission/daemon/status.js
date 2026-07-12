// B"H

const Lock = require("../lock/index.js");
const Scheduler = require("./scheduler.js");

function status(config, payload = {}) {
	const lock = Lock.get(config);
	const active = Boolean(lock && lock.releaseAllowed !== true);
	const missionId = payload.missionId || payload.id || payload.target || lock?.missionId || "";
	const nextSuggestedToolCall = active ? lock?.lastMustCallNext || null : null;
	const scheduler = Scheduler.status(config, { ...payload, missionId });
	return {
		ok: true,
		action: "missionDaemonStatus",
		active,
		running: scheduler.running,
		missionId,
		lock,
		scheduler,
		finalAnswerAllowed: true,
		mustContinue: false,
		nextSuggestedToolCall,
		missionAdvisory: {
			active,
			blocked: Boolean(lock?.blockedOn),
			resumeAvailable: active,
			suggestedNext: nextSuggestedToolCall,
			missionId: missionId || null,
			schedulerRunning: scheduler.running
		}
	};
}

module.exports = { status };
