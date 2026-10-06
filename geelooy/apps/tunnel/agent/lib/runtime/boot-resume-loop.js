//B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./boot-resume-policy.js");
const Schedule = require("./boot-resume-schedule.js");

const DEFAULT_CONTINUATION_TRANSPORT = "shared_shliach";

/**
 * @file Runs an adaptive Mission recovery heartbeat.
 * @description
 * The Awtsmoos lets unfinished work receive a quick pulse while an idle project rests;
 * Awtsmoos.com replaces blind 30-second polling with result-aware scheduling so background
 * Mission memory never competes unnecessarily with interactive tunnel deeds.
 */
function continuationTransport(options = {}, env = {}) {
	const selected = options.transport
		|| env.AWTSMOOS_CONTINUATION_TRANSPORT
		|| DEFAULT_CONTINUATION_TRANSPORT;
	return String(selected || DEFAULT_CONTINUATION_TRANSPORT).trim().toLowerCase();
}

async function cycle(deps, scoped, env, binding, options = {}) {
	const continuationOptions = {
		env,
		enabled: options.autoContinue !== false,
		binding,
		transport: continuationTransport(options, env)
	};
	const continuation = await deps.autoContinuation.run(scoped, continuationOptions);
	const pool = options.pool === false
		? { ok: true, poolSize: 0, scheduled: 0, results: [] }
		: await deps.continuationPool.maintain(
			deps.autoContinuation,
			scoped,
			{ ...continuationOptions, poolSize: options.poolSize }
		);
	const resume = await deps.handleFs({
		action: "missionBootResume",
		autoMission: Policy.autoMission(env),
		ignoreMissionLock: true,
		logicalAgentId: "runtime-boot-resume",
		reason: options.reason || "interval",
		tick: true,
		projectRoot: scoped.root,
		scopeRoot: scoped.root,
		cwd: scoped.root
	});
	return { continuation, pool, resume };
}

function start(log, config, options = {}) {
	const env = options.env || process.env;
	if (!Policy.enabled(env)) {
		log?.(Policy.candidateProbe(env)
			? "Mission continuation disabled in candidate-probe mode."
			: "Mission boot resume explicitly disabled.");
		return null;
	}
	if (!config?.root) {
		log?.("Mission boot resume disabled: canonical project root unavailable.");
		return null;
	}
	const deps = Policy.dependencies(options);
	const recoveryState = options.recoveryState || {};
	let running = false;
	let timer = null;
	let stopped = false;
	async function tick(reason = "interval") {
		if (running) return { ok: true, skipped: true, reason: "tick_already_running" };
		running = true;
		try {
			const binding = Policy.usableBinding(config, deps.projectRoots.read(config));
			const scoped = Policy.scopedConfig(config, binding);
			const result = await cycle(deps, scoped, env, binding, { ...options, reason });
			Policy.logResult(log, reason, result.continuation, result.pool, result.resume);
			Policy.logPromotionOwnership(log, recoveryState);
			return { ok: true, ...result, projectRoot: scoped.root, binding };
		} catch (error) {
			log?.("Mission boot/continuation failed:", error?.stack || error?.message || String(error));
			return { ok: false, error: error?.message || String(error) };
		} finally {
			running = false;
		}
	}
	function schedule(delayMs, reason = "interval") {
		if (stopped) return;
		timer = setTimeout(async () => {
			const result = await tick(reason);
			schedule(Schedule.delayFor(result, env), "interval");
		}, delayMs);
		timer.unref?.();
	}
	const startupDelayMs = Math.max(5000, Number(options.startupDelayMs || 5000));
	schedule(startupDelayMs, "startup");
	return {
		tick,
		get recoveryState() {
			return recoveryState;
		},
		stop() {
			stopped = true;
			if (timer) clearTimeout(timer);
		},
		get timer() {
			return timer;
		}
	};
}

module.exports = {
	...Policy,
	DEFAULT_CONTINUATION_TRANSPORT,
	continuationTransport,
	cycle,
	start
};
