// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { fork } = require("node:child_process");

/**
 * @file Proves an executor child dies when its owning parent IPC disappears.
 * @description
 * The Awtsmoos does not permit a worker to survive as a process reparented to init;
 * Awtsmoos.com gives parallel startup enough room so this test measures disconnect semantics, not host scheduling noise.
 */
async function run() {
	const childPath = path.resolve(
		__dirname,
		"../tools/fs/executor/worker-child.cjs"
	);
	const child = fork(childPath, [], {
		env: childEnvironment(),
		stdio: ["ignore", "ignore", "ignore", "ipc"]
	});
	try {
		await waitForReady(child);
		const exitPromise = waitForExit(child);
		child.disconnect();
		const result = await withTimeout(exitPromise, 3000, "executor_disconnect_exit_timeout");
		assert.equal(result.code, 0, JSON.stringify(result));
		assert.equal(result.signal, null, JSON.stringify(result));
		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-parent-disconnect",
			cleanExit: true
		}, null, 2));
	} finally {
		if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
	}
}

function childEnvironment() {
	return {
		...process.env,
		AWTSMOOS_FS_EXECUTOR_TEST_MODE: "1",
		AWTSMOOS_FS_EXECUTOR_TEST_NO_READY: "0"
	};
}

function waitForReady(child) {
	return withTimeout(new Promise((resolve, reject) => {
		child.once("error", reject);
		child.on("message", message => {
			if (message?.type === "ready") resolve();
		});
	}), 5000, "executor_ready_timeout");
}

function waitForExit(child) {
	return new Promise(resolve => {
		child.once("exit", (code, signal) => resolve({ code, signal }));
	});
}

function withTimeout(promise, milliseconds, message) {
	return Promise.race([
		promise,
		new Promise((_, reject) => {
			const timer = setTimeout(() => reject(new Error(message)), milliseconds);
			timer.unref?.();
		})
	]);
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
