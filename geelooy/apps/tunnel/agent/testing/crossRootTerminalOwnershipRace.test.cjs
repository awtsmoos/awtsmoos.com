// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Monitor = require("../tools/fs/commandJob/crossRootMonitor.js");
const Supervisor = require("../lib/runtime/worker-supervisor.js");

/**
 * @file Proves detached recovery cannot overwrite normal command finalization.
 * @description
 * The Awtsmoos joins disk testimony and live ownership without rivalry.
 * Awtsmoos.com stops when terminal truth is durable and yields while the exact
 * registry-owned worker still carries its original process listeners.
 */
(async () => {
	await terminalTruthStopsWithoutObservation();
	await liveOwnershipYieldsWithoutFinalization();
	console.log(JSON.stringify({
		ok: true,
		suite: "cross-root-terminal-ownership-race",
		passed: 2
	}));
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function terminalTruthStopsWithoutObservation() {
	let observed = 0;
	let finalized = 0;
	const record = commandRecord("terminal-race", 2101, "terminal-birth");
	const key = Monitor.start(record, decision(record), {
		recoveredPollMs: 60000
	}).key;
	const entry = Monitor.active.get(key);
	await Monitor.tick(key, entry, {
		readMeta: async () => ({ ...record.meta, status: "completed" }),
		observe: async () => {
			observed += 1;
			return { alive: false, pid: 2101 };
		},
		finalize: async () => {
			finalized += 1;
		}
	});
	assert.equal(observed, 0);
	assert.equal(finalized, 0);
	assert.equal(Monitor.active.has(key), false);
}

async function liveOwnershipYieldsWithoutFinalization() {
	let observed = 0;
	let finalized = 0;
	const record = commandRecord("live-race", 2102, "live-birth");
	const registry = Supervisor.createRegistry();
	registry.registerWorker(registryRecord(record.meta), {});
	const key = Monitor.start(record, decision(record), {
		recoveredPollMs: 60000
	}).key;
	const entry = Monitor.active.get(key);
	await Monitor.tick(key, entry, {
		registry,
		readMeta: async () => record.meta,
		observe: async () => {
			observed += 1;
			return { alive: false, pid: 2102 };
		},
		finalize: async () => {
			finalized += 1;
		}
	});
	assert.equal(observed, 0);
	assert.equal(finalized, 0);
	assert.equal(Monitor.active.has(key), true);
	Monitor.stop(key);
}

function commandRecord(jobId, pid, birthToken) {
	const processIdentity = {
		pid,
		processGroupId: pid,
		birthToken,
		platform: process.platform
	};
	return {
		jobId,
		stateRoot: `/tmp/${jobId}`,
		currentRoot: true,
		rootConfig: {},
		meta: {
			jobId,
			workerId: `worker-${jobId}`,
			status: "running",
			processIdentity
		}
	};
}

function decision(record) {
	return {
		expected: record.meta.processIdentity
	};
}

function registryRecord(meta) {
	return {
		workerId: meta.workerId,
		jobId: meta.jobId,
		state: "running",
		pid: meta.processIdentity.pid,
		processGroupId: meta.processIdentity.processGroupId,
		birthToken: meta.processIdentity.birthToken,
		platform: process.platform
	};
}
