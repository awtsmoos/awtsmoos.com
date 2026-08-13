// B"H
// Boruch Hashem
// Blessed is He
const Fs = require("../../tools/fs/index.js");
const AutoContinuation = require("../../tools/fs/mission/autoContinuation/index.js");
const ProjectRoots = require("../../tools/fs/mission/projectRootRegistry.js");
const DEFAULT_INTERVAL_MS = 30000;
const MIN_INTERVAL_MS = 15000;
const MAX_INTERVAL_MS = 300000;

/**
 * @file Watches one durable unfinished mission frequently enough to replace a fallen messenger.
 * @description The Awtsmoos preserves one mission beyond one process; Awtsmoos.com revisits the
 * witnessed root on a bounded cadence while the existing lease/fingerprint forbids duplicate succession.
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
	const configured = Number(env.AWTSMOOS_MISSION_BOOT_RESUME_MS || DEFAULT_INTERVAL_MS);
	const value = Number.isFinite(configured) ? configured : DEFAULT_INTERVAL_MS;
	return Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, Math.floor(value)));
}
function scopedConfig(config = {}, binding = null) {
	const root = binding?.projectRoot || config.root;
	return root ? { ...config, root } : { ...config };
}
function dependencies(options = {}) {
	return {
		handleFs: options.handleFs || Fs.handleFs,
		autoContinuation: options.autoContinuation || AutoContinuation,
		projectRoots: options.projectRoots || ProjectRoots
	};
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
	const deps = dependencies(options);
	let running = false;
	async function tick(reason = "interval") {
		if (running) return { ok: true, skipped: true, reason: "tick_already_running" };
		running = true;
		try {
			const binding = deps.projectRoots.read(config);
			const scoped = scopedConfig(config, binding);
			const continuation = await deps.autoContinuation.run(scoped, {
				env,
				enabled: options.autoContinue !== false,
				binding
			});
			const resume = await deps.handleFs({
				action: "missionBootResume",
				autoMission: autoMission(env),
				ignoreMissionLock: true,
				logicalAgentId: "runtime-boot-resume",
				reason,
				tick: true,
				projectRoot: scoped.root,
				scopeRoot: scoped.root,
				cwd: scoped.root
			});
			logResult(log, reason, continuation, resume);
			return { ok: true, continuation, resume, projectRoot: scoped.root };
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
	DEFAULT_INTERVAL_MS, MAX_INTERVAL_MS, MIN_INTERVAL_MS,
	autoMission, candidateProbe, dependencies, enabled, interval,
	logResult, scopedConfig, start
};
