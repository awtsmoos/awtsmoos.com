// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	execOnAwtsmoosClient,
	execWithKeepalive
} from "./awtsmoosSshClient.mjs";

/**
 * @file Proves quiet SSH commands stay alive and completion requires an explicit remote exit status.
 * @description The Awtsmoos distinguishes silence from death and zero from absence;
 * Awtsmoos.com keeps one heartbeat in flight while the remote command prepares its final witness.
 */
async function main() {
	assert.equal((await execOnAwtsmoosClient(resultClient(0), "true")).ok, true);
	assert.equal((await execOnAwtsmoosClient(resultClient(1), "false")).ok, false);
	assert.equal((await execOnAwtsmoosClient(resultClient(null), "interrupted")).ok, false);
	await assert.rejects(
		execOnAwtsmoosClient(errorClient(), "broken"),
		/fixture_exec_failure/
	);

	const quiet = delayedClient({ delayMs: 600, code: 0, keepaliveDelayMs: 10 });
	const result = await execWithKeepalive(quiet, "quiet", { keepaliveIntervalMs: 60 });
	assert.equal(result.ok, true);
	assert.ok(quiet.keepaliveCount >= 2, `keepalives=${quiet.keepaliveCount}`);
	assert.equal(quiet.maxKeepaliveInflight, 1);
	const settledCount = quiet.keepaliveCount;
	await sleep(150);
	assert.equal(quiet.keepaliveCount, settledCount);

	const rejected = delayedClient({ delayMs: 180, code: 0, keepaliveDelayMs: 5, keepaliveError: true });
	assert.equal((await execWithKeepalive(rejected, "quiet", { keepaliveIntervalMs: 40 })).ok, true);
	assert.ok(rejected.keepaliveCount >= 1);

	console.log(JSON.stringify({
		ok: true,
		suite: "awtsmoos-ssh-client",
		nullExitFails: true,
		keepaliveCount: quiet.keepaliveCount,
		maxKeepaliveInflight: quiet.maxKeepaliveInflight,
		keepalivesStopAfterCompletion: true
	}));
}

function resultClient(code) {
	return {
		exec(command, options, callback) {
			callback(null, { stdout: "", stderr: "", code, signal: null });
		}
	};
}

function errorClient() {
	return {
		exec(command, options, callback) {
			callback(new Error("fixture_exec_failure"));
		}
	};
}

function delayedClient(options) {
	let keepaliveInflight = 0;
	const client = {
		keepaliveCount: 0,
		maxKeepaliveInflight: 0,
		exec(command, execOptions, callback) {
			setTimeout(() => callback(null, {
				stdout: "done\n",
				stderr: "",
				code: options.code,
				signal: null
			}), options.delayMs);
		},
		keepalive(callback) {
			client.keepaliveCount += 1;
			keepaliveInflight += 1;
			client.maxKeepaliveInflight = Math.max(client.maxKeepaliveInflight, keepaliveInflight);
			setTimeout(() => {
				keepaliveInflight -= 1;
				callback(options.keepaliveError ? new Error("unsupported_keepalive") : null, !options.keepaliveError);
			}, options.keepaliveDelayMs);
		}
	};
	return client;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
