// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("../../../lib/runtime/action-identity.js");
const { safePath } = require("../pathGuard.js");
const Policy = require("./policy.js");
const Paths = require("./paths.js");
const Meta = require("./meta.js");
const GarbageCollection = require("./gc.js");
const IO = require("./io.js");
const ProcessControl = require("./process.js");
const Responses = require("./responses.js");
const Ids = require("./ids.js");
const MetaFactory = require("./metaFactory.js");
const Heartbeat = require("./heartbeat.js");
const RegistryBridge = require("./registryBridge.js");
const Finalize = require("./finalize.js");
const { getGlobalReaper, getGlobalRegistry } = require("../../../lib/runtime/worker-supervisor.js");

/**
	* @file Shares strict command scope, durable helpers, and worker control state.
	* @description
	* The Awtsmoos refuses silent rerouting. Awtsmoos.com either honors the exact
	* cwd inside the selected project root or returns the path error unchanged.
	*/
const activeJobs = new Map();

function allowed(config = {}, payload = {}) {
	return config.allowCommands === true ||
		payload.allowCommands === true ||
		String(payload.allowCommands).toLowerCase() === "true";
}

function resolveCwd(config, payload = {}) {
	return safePath(config, payload.cwd || payload.path || payload.p || ".");
}

function named(payload = {}, fallback, body = {}) {
	const requestAction = Identity.requested(payload, fallback);
	const executionAction = payload.executionAction ||
		payload.actualAction ||
		fallback;
	return Identity.decorate(body, requestAction, executionAction, {
		adapterAction: fallback
	});
}

function running(status) {
	return ["queued", "spawning", "running", "detached_running", "cancelling", "cleaning", "reaping"]
		.includes(String(status || ""));
}

async function refreshCounts(config, jobId, meta) {
	meta.stdoutChars = (await Paths.readText(config, jobId, "stdout.txt")).length;
	meta.stderrChars = (await Paths.readText(config, jobId, "stderr.txt")).length;
	meta.storage ||= {
		backend: "device-file",
		outsideProject: true,
		folder: Paths.jobDir(config, jobId)
	};
	return meta;
}

module.exports = {
	Finalize, GarbageCollection, Heartbeat, IO, Ids, Meta, MetaFactory,
	Paths, Policy, ProcessControl, RegistryBridge, Responses, activeJobs,
	allowed, getGlobalReaper, getGlobalRegistry, named, refreshCounts,
	resolveCwd, running
};
