// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-cancel-envelope-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
	tunnelName: "awt-cancel-envelope",
	root
}));

const Cancel = require("../tools/fs/commandJob/cancel.js");
const Context = require("../tools/fs/commandJob/context.js");
const Envelope = require("../lib/runtime/envelope.js");

/** Proves a lost reap claim retains cancellation causality through final delivery. */
async function main() {
	const config = { commandStateRoot: root, root };
	const jobId = "cmdjob_cancel_race";
	const terminal = {
		jobId,
		workerId: "worker_cancel_race",
		status: "stale_lost_worker",
		processComparison: { state: "dead" },
		error: "recovered_process_exited_unobserved"
	};
	await Context.Meta.write(config, jobId, terminal);
	const result = await Cancel.cancelLive(config, {
		action: "commandCancel",
		requestAction: "commandCancel"
	}, jobId, {
		meta: { jobId, workerId: terminal.workerId, status: "detached_running" },
		reaper: {
			reapWorker: async () => ({
				ok: true,
				claimed: false,
				record: { state: "reaping" }
			})
		}
	});
	assert.equal(result.cancelled, false);
	assert.equal(result.alreadyTerminal, true);
	assert.equal(result.reaperClaimed, false);
	const delivered = Envelope.responseEnvelope(
		{ id: "cancel-race-response" },
		{ action: "commandCancel", controlRequestId: "cancel-race-control" },
		result,
		Date.now(),
		() => ({ inflight: 0, queued: 0 })
	);
	assert.equal(delivered.status, "stale_lost_worker");
	assert.equal(delivered.cancelled, false);
	assert.equal(delivered.alreadyTerminal, true);
	assert.equal(delivered.detachedRecovered, false);
	assert.equal(delivered.reaperClaimed, false);
	assert.equal(delivered.reaperTimedOut, false);
	assert.equal(delivered.processComparison.state, "dead");
	console.log(JSON.stringify({
		ok: true,
		suite: "command-cancel-final-envelope-race"
	}, null, 2));
}

main().finally(() => {
	fs.rmSync(root, { recursive: true, force: true });
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
