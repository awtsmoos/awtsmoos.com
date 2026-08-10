// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Context = require("../tools/fs/commandJob/context.js");
const Launcher = require("../tools/fs/commandJob/launcher.js");
const Lifecycle = require("../tools/fs/commandJob/lifecycle.js");
const Process = require("../tools/fs/commandJob/process.js");
const Cleanup = require("../tools/fs/commandJob/processCleanup.js");
const Observe = require("../tools/fs/commandJob/processObserve.js");

/**
 * @file Proves command custody returns before slow identity enrichment and cleanup stays fail-closed.
 * @description
 * The Awtsmoos gives a living command its receipt without waiting for a second witness to speak;
 * Awtsmoos.com never signals an unverified process family, so delayed testimony cannot make custody weak.
 */
(async () => {
	await proveStartReceiptDoesNotWaitForIdentity();
	proveUnavailableIdentityFailsClosed();
	await proveCleanupNeverSignalsUnverifiedBirth();
	console.log(JSON.stringify({ ok: true, suite: "command-start-anti-cage" }));
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function proveStartReceiptDoesNotWaitForIdentity() {
	const restores = [];
	const never = new Promise(() => {});
	try {
		patch(Context.MetaFactory, "markLaunched", meta => meta.status = "running", restores);
		patch(Context.ProcessControl, "spawn", () => ({ pid: 321, processGroupId: 321 }), restores);
		patch(Context.ProcessControl, "renice", () => false, restores);
		patch(Context.ProcessControl, "preliminary", () => identity(""), restores);
		patch(Context.MetaFactory, "attachPreliminary", attachPreliminary, restores);
		patch(Lifecycle, "createLive", (_c, _p, _j, _s, meta) => ({ meta }), restores);
		patch(Lifecycle, "wireProcess", () => {}, restores);
		patch(Lifecycle, "beginIdentity", (_c, _j, live) => live.identityPromise = never, restores);
		patch(Context.Meta, "write", async (_c, _j, meta) => ({ ...meta, revision: 1 }), restores);
		patch(Context.Responses, "start", (jobId, args) => ({ ok: true, jobId, pid: args.meta.pid }), restores);
		const meta = baseMeta();
		const response = await Promise.race([
			Launcher.launch({}, {}, meta),
			delay(100).then(() => { throw new Error("launcher_waited_for_identity"); })
		]);
		assert.equal(response.jobId, "job_test");
		assert.equal(response.pid, 321);
	} finally {
		restores.reverse().forEach(restore => restore());
	}
}

function proveUnavailableIdentityFailsClosed() {
	const unavailable = Observe.unavailable(321, new Error("probe_timeout"));
	assert.throws(
		() => Process.assertObservable(unavailable),
		error => error.code === "process_identity_unavailable" && error.processAlive === null
	);
}

async function proveCleanupNeverSignalsUnverifiedBirth() {
	let signals = 0;
	const result = await Cleanup.cleanup(identity(""), {
		observe: async () => ({ ...identity("actual-token"), alive: true }),
		groupAlive: async () => true,
		signalGroup: async () => { signals += 1; return { sent: true }; }
	});
	assert.equal(result.state, "identity_unverified");
	assert.equal(signals, 0);
}

function attachPreliminary(meta, value) {
	meta.processIdentity = value;
	meta.pid = value.pid;
	meta.processGroupId = value.processGroupId;
	meta.status = "running";
}

function baseMeta() {
	return {
		jobId: "job_test",
		workerId: "worker_test",
		command: "echo test",
		cwd: "/tmp",
		shell: "/bin/sh",
		timeoutMs: 1000,
		storage: { backend: "test" },
		status: "queued"
	};
}

function identity(birthToken) {
	return { pid: 321, processGroupId: 321, birthToken, platform: process.platform };
}

function patch(target, key, value, restores) {
	const original = target[key];
	target[key] = value;
	restores.push(() => target[key] = original);
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
