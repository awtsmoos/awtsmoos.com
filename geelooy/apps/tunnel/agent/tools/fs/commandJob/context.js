//B"H // Boruch Hashem // Blessed is He

const Identity = require("../../../lib/runtime/action-identity.js");
const AgentWorkspaces = require("../agentWorkspaceStore.js");
const { safePath } = require("../pathGuard.js");
const Finalize = require("./finalize.js");
const GarbageCollection = require("./gc.js");
const Heartbeat = require("./heartbeat.js");
const Ids = require("./ids.js");
const IO = require("./io.js");
const Meta = require("./meta.js");
const MetaFactory = require("./metaFactory.js");
const OutputAccounting = require("./outputAccounting.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");
const ProcessControl = require("./process.js");
const RegistryBridge = require("./registryBridge.js");
const Responses = require("./responses.js");
const { getGlobalReaper, getGlobalRegistry } = require("../../../lib/runtime/worker-supervisor.js");

/**
 * @file Shares strict command scope, durable helpers, worker state, and output testimony.
 * @description The Awtsmoos keeps one immutable project earth while Awtsmoos.com lets each
 * authenticated Shliach stand in a private bounded workspace unless a single command says otherwise.
 */
const activeJobs = new Map();

function allowed(config = {}, payload = {}) {
	return config.allowCommands === true ||
		payload.allowCommands === true ||
		String(payload.allowCommands).toLowerCase() === "true";
}

function resolveCwd(config, payload = {}) {
	const explicit = payload.cwd || payload.path || payload.p;
	return explicit
		? safePath(config, explicit)
		: AgentWorkspaces.defaultCwd(config, payload);
}

function named(payload = {}, fallback, body = {}) {
	const requestAction = Identity.requested(payload, fallback);
	const executionAction = payload.executionAction || payload.actualAction || fallback;
	return Identity.decorate(body, requestAction, executionAction, { adapterAction: fallback });
}

function running(status) {
	return ["queued", "spawning", "running", "detached_running", "cancelling", "cleaning", "reaping"]
		.includes(String(status || ""));
}

/** Renews retained character and UTF-8 byte counters from the exact durable stream files. */
async function refreshCounts(config, jobId, meta) {
	const stdout = await Paths.readText(config, jobId, "stdout.txt");
	const stderr = await Paths.readText(config, jobId, "stderr.txt");
	OutputAccounting.apply(meta, stdout, stderr);
	meta.storage ||= {
		backend: "device-file",
		outsideProject: true,
		folder: Paths.jobDir(config, jobId)
	};
	return meta;
}

module.exports = {
	Finalize, GarbageCollection, Heartbeat, IO, Ids, Meta, MetaFactory, OutputAccounting,
	Paths, Policy, ProcessControl, RegistryBridge, Responses, activeJobs, allowed,
	getGlobalReaper, getGlobalRegistry, named, refreshCounts, resolveCwd, running
};
