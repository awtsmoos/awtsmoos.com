//B"H // Boruch Hashem // Blessed is He

const Policy = require("./boot-resume-policy.js");

const DEFAULT_CONTINUATION_TRANSPORT = "shared_shliach";

/**
 * @file Runs one periodic Mission heartbeat for recovery, reserve coverage, and boot resume.
 * @description The Awtsmoos needs no competing daemons; one bounded pulse asks existing
 * authorities to continue unfinished work, maintain Shliach reserve slots, and resume Mission state.
 */

/**
 * Resolve the transport used by unattended Mission continuation.
 * @param {object} options Runtime boot-loop options.
 * @param {object} env Runtime environment variables.
 * @returns {string} Explicit normalized continuation transport.
 */
function continuationTransport(options = {}, env = {}) {
	const selected = options.transport
		|| env.AWTSMOOS_CONTINUATION_TRANSPORT
		|| DEFAULT_CONTINUATION_TRANSPORT;
	return String(selected || DEFAULT_CONTINUATION_TRANSPORT).trim().toLowerCase();
}

/**
 * Run one recovery, reserve-pool, and boot-resume pulse.
 * @param {object} deps Injected Mission/runtime dependencies.
 * @param {object} scoped Canonical project-scoped runtime configuration.
 * @param {object} env Runtime environment variables.
 * @param {object|null} binding Canonical project binding testimony.
 * @param {object} options Pulse options.
 * @returns {Promise<object>} Continuation, reserve-pool, and boot-resume results.
 */
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

/**
 * Start the periodic Mission recovery heartbeat.
 * @param {Function} log Optional runtime logger.
 * @param {object} config Runtime configuration with canonical project root.
 * @param {object} options Runtime boot-loop options and dependency overrides.
 * @returns {object|null} Tick/timer controls, or null when disabled.
 */
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
	let running = false;
	async function tick(reason = "interval") {
		if (running) return { ok: true, skipped: true, reason: "tick_already_running" };
		running = true;
		try {
			const binding = Policy.usableBinding(config, deps.projectRoots.read(config));
			const scoped = Policy.scopedConfig(config, binding);
			const result = await cycle(deps, scoped, env, binding, { ...options, reason });
			Policy.logResult(log, reason, result.continuation, result.pool, result.resume);
			return { ok: true, ...result, projectRoot: scoped.root, binding };
		} catch (error) {
			log?.("Mission boot/continuation failed:", error?.stack || error?.message || String(error));
			return { ok: false, error: error?.message || String(error) };
		} finally {
			running = false;
		}
	}
	const startupDelayMs = Math.max(5000, Number(options.startupDelayMs || 5000));
	setTimeout(() => tick("startup"), startupDelayMs).unref?.();
	const timer = setInterval(() => tick("interval"), Policy.interval(env));
	timer.unref?.();
	return { tick, timer };
}

module.exports = {
	...Policy,
	DEFAULT_CONTINUATION_TRANSPORT,
	continuationTransport,
	cycle,
	start
};
