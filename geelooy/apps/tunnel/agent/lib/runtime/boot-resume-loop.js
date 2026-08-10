// B"H
// Boruch Hashem
// Blessed is He

const { handleFs } = require("../../tools/fs/index.js");
const AutoContinuation = require("../../tools/fs/mission/autoContinuation/index.js");

/**
 * @file Resumes durable mission state and schedules one idempotent continuation when work goes silent.
 * @description
 * The Awtsmoos lets an interrupted shliach return through the same mission vessel.
 * Awtsmoos.com never runs this browser-capable loop inside a readonly update candidate.
 */
function candidateProbe(env = process.env) {
	return String(env.AWTSMOOS_REGISTRATION_MODE || "") === "candidate-probe";
}

function enabled(env = process.env) {
	if (candidateProbe(env)) return false;
	return String(env.AWTSMOOS_MISSION_BOOT_RESUME || "") !== "0";
}

function autoMission(env = process.env) {
	return String(env.AWTSMOOS_AUTO_MISSION || "") === "1";
}

function interval(env = process.env) {
	return Math.max(60000, Number(env.AWTSMOOS_MISSION_BOOT_RESUME_MS || 300000));
}

function start(log, config, options = {}) {
	const env = options.env || process.env;
	if (!enabled(env)) {
		log?.(candidateProbe(env)
			? "Mission continuation disabled in candidate-probe mode."
			: "Mission boot resume explicitly disabled.");
		return null;
	}
	if (!config?.root) {
		log?.("Mission boot resume disabled: canonical project root unavailable.");
		return null;
	}
	let running = false;
	async function tick(reason = "interval") {
		if (running) return { ok: true, skipped: true, reason: "tick_already_running" };
		running = true;
		try {
			const continuation = await AutoContinuation.run(config, {
				env,
				enabled: options.autoContinue !== false
			});
			const resume = await handleFs({
				action: "missionBootResume",
				autoMission: autoMission(env),
				ignoreMissionLock: true,
				logicalAgentId: "runtime-boot-resume",
				reason,
				tick: true
			});
			logResult(log, reason, continuation, resume);
			return { ok: true, continuation, resume };
		} catch (error) {
			log?.("Mission boot/continuation failed:", error?.stack || error?.message || String(error));
			return { ok: false, error: error?.message || String(error) };
		} finally {
			running = false;
		}
	}
	const startupDelayMs = Math.max(5000, Number(options.startupDelayMs || 5000));
	setTimeout(() => tick("startup"), startupDelayMs).unref?.();
	const timer = setInterval(() => tick("interval"), interval(env));
	timer.unref?.();
	return { tick, timer };
}

function logResult(log, reason, continuation, resume) {
	if (!continuation?.scheduled && !resume?.resumed && !resume?.autoStart?.started) return;
	log?.("Mission boot/continuation:", JSON.stringify({
		reason,
		continuationScheduled: Boolean(continuation?.scheduled),
		continuationReason: continuation?.reason || "",
		websiteMissionId: continuation?.websiteMissionId || "",
		resumed: Boolean(resume?.resumed),
		mustCallNext: resume?.mustCallNext?.action || ""
	}));
}

module.exports = {
	autoMission,
	candidateProbe,
	enabled,
	interval,
	logResult,
	start
};
