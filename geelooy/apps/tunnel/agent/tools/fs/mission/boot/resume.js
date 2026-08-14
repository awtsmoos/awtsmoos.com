// B"H
// Boruch Hashem
// Blessed is He

const Watchdog = require("../watchdog/index.js");
const Lock = require("../lock/index.js");
const Persistence = require("../lock/persistence.js");
const Policy = require("../bootPolicy/index.js");
const Auto = require("../autoStart/index.js");

/**
 * @file Resumes missions without bypassing congestion-safe persistence.
 * @description Boot-loop bookkeeping joins lock, lineage, and heartbeat persistence, so a
 * healthy exclusive writer produces one durable deferred witness instead of control failure.
 */
function isBoot(next = {}) {
	return String(next?.action || "") === "missionBootResume";
}

function sameMission(next = {}, missionId = "") {
	return !next?.missionId || !missionId || String(next.missionId) === String(missionId);
}

function loopCount(lock = {}) {
	return Number(lock.bootResumeSelfLoopCount || 0);
}

function daemonNext(lock = {}, reason = "boot_resume_self_loop_escape") {
	return { action: "missionDaemonTick", missionId: lock.missionId || "", reason };
}

function markLoop(config, lock = {}, next = {}) {
	if (!lock?.missionId) return lock;
	const count = isBoot(next) && sameMission(next, lock.missionId) ? loopCount(lock) + 1 : 0;
	lock.bootResumeSelfLoopCount = count;
	lock.bootResumeSelfLoopAt = count ? new Date().toISOString() : "";
	if (count >= 2) {
		lock.lastMustCallNext = daemonNext(lock);
		lock.loopDiagnostics = loopDiagnostics(count);
	}
	lock.persistence = Persistence.persist(config, lock);
	return lock;
}

function loopDiagnostics(count) {
	return {
		bootResumeSelfLoop: true,
		bootResumeSelfLoopCount: count,
		chosenEscape: "missionDaemonTick",
		plainEnglish: "missionBootResume repeated. Resume remains available through productive diagnostics."
	};
}

function explainLoop(lock = {}) {
	return {
		bootResumeSelfLoop: true,
		bootResumeSelfLoopCount: loopCount(lock),
		why: "Boot resume did not discover a fresher next action and would repeat itself.",
		whatToDo: "Resume is available through missionDaemonTick or productive mission diagnostics.",
		agentFreedom: "Foreground answers and unrelated safe work remain allowed."
	};
}

async function resume(config, payload = {}, buildActions) {
	let status = Watchdog.status(config);
	let autoStart = null;
	if (!status.active && Policy.enabled(payload)) {
		autoStart = await Auto.create(config, payload, buildActions);
		status = Watchdog.status(config);
	}
	if (!status.active) return advisory({ ok: true, action: "missionBootResume", resumed: false, autoStart, reason: "no_active_lock", resumeAvailable: false });
	const tick = payload.tick === false || payload.tick === "false" ? null : await Watchdog.tick(config, payload, buildActions);
	let lock = Lock.active(config) || status.lock || {};
	const rawNext = tick?.nextSuggestedToolCall || tick?.mustCallNext || status.nextSuggestedToolCall || status.mustCallNext || lock.lastMustCallNext || null;
	lock = markLoop(config, lock, rawNext) || lock;
	const escaped = loopCount(lock) >= 2;
	const nextSuggestedToolCall = escaped ? daemonNext(lock) : rawNext;
	return advisory({
		ok: true, action: "missionBootResume", resumed: true, autoStart, status, tick, lock,
		resumeAvailable: true, nextSuggestedToolCall, bootResumeSelfLoop: escaped,
		bootResumeDiagnostics: escaped ? explainLoop(lock) : null,
		missionAdvisory: { active: true, blocked: false, resumeAvailable: true, suggestedNext: nextSuggestedToolCall, missionId: lock.missionId || status.missionId || null }
	});
}

function advisory(output = {}) {
	return { ...output, finalAnswerAllowed: true, mustContinue: false, userVisibleAnswerBlocked: false };
}

module.exports = { advisory, daemonNext, explainLoop, isBoot, loopCount, markLoop, resume, sameMission };
