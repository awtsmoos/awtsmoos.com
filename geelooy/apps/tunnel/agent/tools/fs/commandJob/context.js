// B"H
const { safePath } = require('../pathGuard.js');
const Policy = require('./policy.js');
const Paths = require('./paths.js');
const Meta = require('./meta.js');
const GarbageCollection = require('./gc.js');
const IO = require('./io.js');
const ProcessControl = require('./process.js');
const Responses = require('./responses.js');
const Ids = require('./ids.js');
const MetaFactory = require('./metaFactory.js');
const Heartbeat = require('./heartbeat.js');
const RegistryBridge = require('./registryBridge.js');
const Finalize = require('./finalize.js');
const { getGlobalRegistry } = require('../../../lib/runtime/worker-supervisor.js');

/** B"H — One shared context owns active command handles and durable helpers. */
const activeJobs = new Map();

function allowed(config = {}, payload = {}) {
	return config.allowCommands === true ||
		payload.allowCommands === true ||
		String(payload.allowCommands).toLowerCase() === 'true';
}

function resolveCwd(config, payload = {}) {
	try {
		return safePath(config, payload.cwd || payload.path || payload.p || '.');
	} catch {
		return config.root || process.cwd();
	}
}

function named(payload = {}, fallback, body = {}) {
	const action = String(payload.requestAction || payload.action || fallback);
	return { ...body, action, requestAction: action, actualAction: action };
}

function running(status) {
	return ['queued', 'spawning', 'running', 'detached_running', 'cancelling', 'cleaning'].includes(String(status || ''));
}

async function refreshCounts(config, jobId, meta) {
	meta.stdoutChars = (await Paths.readText(config, jobId, 'stdout.txt')).length;
	meta.stderrChars = (await Paths.readText(config, jobId, 'stderr.txt')).length;
	meta.storage ||= {
		backend: 'device-file',
		outsideProject: true,
		folder: Paths.jobDir(config, jobId)
	};
	return meta;
}

module.exports = {
	Finalize,
	GarbageCollection,
	Heartbeat,
	IO,
	Ids,
	Meta,
	MetaFactory,
	Paths,
	Policy,
	ProcessControl,
	RegistryBridge,
	Responses,
	activeJobs,
	allowed,
	getGlobalRegistry,
	named,
	refreshCounts,
	resolveCwd,
	running
};
