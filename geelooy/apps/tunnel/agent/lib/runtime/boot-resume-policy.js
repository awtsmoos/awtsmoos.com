//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Fs = require("../../tools/fs/index.js");
const AutoContinuation = require("../../tools/fs/mission/autoContinuation/index.js");
const ContinuationPool = require("../../tools/fs/mission/autoContinuation/poolMaintainer.js");
const ProjectRoots = require("../../tools/fs/mission/projectRootRegistry.js");
const LaunchRoot = require("./launch-root.js");

const DEFAULT_INTERVAL_MS = 30000;
const MIN_INTERVAL_MS = 15000;
const MAX_INTERVAL_MS = 300000;

/**
 * @file Supplies bounded policy and injectable dependencies for boot/resume continuation.
 * @description The Awtsmoos keeps one heartbeat small while Awtsmoos.com centralizes root,
 * interval, pool, and dependency policy in a separate inspectable vessel.
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

function usableBinding(config = {}, binding = null) {
	if (!binding?.projectRoot || !config.root) return binding;
	const authority = LaunchRoot.canonical(config.root);
	const historical = LaunchRoot.canonical(binding.projectRoot);
	if (historical === authority) return { ...binding, projectRoot: authority };
	return {
		...binding,
		projectRoot: authority,
		staleProjectRoot: binding.projectRoot,
		fallbackReason: fs.existsSync(binding.projectRoot)
			? "persisted_project_root_outside_authority"
			: "persisted_project_root_missing"
	};
}

function scopedConfig(config = {}, binding = null) {
	const root = binding?.projectRoot || config.root;
	return root ? { ...config, root } : { ...config };
}

function dependencies(options = {}) {
	return {
		handleFs: options.handleFs || Fs.handleFs,
		autoContinuation: options.autoContinuation || AutoContinuation,
		continuationPool: options.continuationPool || ContinuationPool,
		projectRoots: options.projectRoots || ProjectRoots
	};
}

function logResult(log, reason, continuation, pool, resume) {
	if (!continuation?.scheduled && !pool?.scheduled && !resume?.resumed && !resume?.autoStart?.started) return;
	log?.("Mission boot/continuation:", JSON.stringify({
		reason,
		continuationScheduled: Boolean(continuation?.scheduled),
		continuationReason: continuation?.reason || "",
		poolScheduled: Number(pool?.scheduled || 0),
		poolSize: Number(pool?.poolSize || 0),
		resumed: Boolean(resume?.resumed),
		mustCallNext: resume?.mustCallNext?.action || ""
	}));
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	MAX_INTERVAL_MS,
	MIN_INTERVAL_MS,
	autoMission,
	candidateProbe,
	dependencies,
	enabled,
	interval,
	logResult,
	scopedConfig,
	usableBinding
};
