// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Arbitration = require("../tools/fs/commandJob/reapArbitration.js");
const Finalization = require("../tools/fs/commandJob/finalization.js");
const FinalizationLease = require("../tools/fs/commandJob/finalizationLease.js");

/**
 * @file Proves successful process exit outranks automatic stale reaping.
 * @description
 * The Awtsmoos witnesses an ending before delayed storage can rename it lost.
 * Awtsmoos.com still lets explicit cancellation and genuine live-worker cleanup
 * pass through their independent control roads.
 */
async function main() {
	const originalReserve = Finalization.reserve;
	Finalization.reserve = reserveStub;
	try {
		const direct = liveRecord({ exitCode: 0 });
		const directMeta = await Arbitration.preferNormal(
			{},
			"job-direct-exit",
			direct,
			staleRequest()
		);
		assert.equal(directMeta.status, "completed");
		assert.equal(direct.terminalOwner, "normal");
		assert.equal(directMeta.reapDeferredToProcessExit, true);
		const delayed = liveRecord({ exitCode: null });
		setTimeout(() => {
			delayed.child.exitCode = 0;
		}, 40);
		const delayedMeta = await Arbitration.preferNormal(
			{},
			"job-delayed-exit",
			delayed,
			staleRequest(),
			{
				observe: async () => ({ alive: false, pid: 42 }),
				waitMs: 500,
				pollMs: 10
			}
		);
		assert.equal(delayedMeta.status, "completed");
		const cancelled = await Arbitration.preferNormal(
			{},
			"job-cancelled",
			liveRecord({ exitCode: 0 }),
			{ status: "cancelled", reason: "explicit_cancel" }
		);
		assert.equal(cancelled, null);
		verifyFinalizationLease();
		console.log("successful child exit wins over automatic stale reaping");
	} finally {
		Finalization.reserve = originalReserve;
	}
}

async function reserveStub(config, jobId, live, producer) {
	live.terminalOwner = "normal";
	live.finalizing = Promise.resolve()
		.then(producer)
		.then(patch => ({ jobId, ...patch }));
	return live.finalizing;
}

function liveRecord(child) {
	return {
		child,
		meta: {
			jobId: "job-exit",
			workerId: "worker-exit",
			pid: 42,
			processIdentity: {
				pid: 42,
				processGroupId: 42,
				birthToken: "birth"
			}
		}
	};
}

function staleRequest() {
	return {
		status: "stale_lost_worker",
		reason: "worker_heartbeat_stale"
	};
}

function verifyFinalizationLease() {
	let patch;
	const live = liveRecord({ exitCode: 0 });
	live.registry = {
		updateWorker(workerId, value) {
			patch = { workerId, ...value };
		}
	};
	const lease = FinalizationLease.renew(
		live,
		"2026-07-21T16:00:00.000Z",
		{ leaseMs: 5000 }
	);
	assert.equal(patch.state, "finalizing");
	assert.equal(patch.workerId, "worker-exit");
	assert.equal(lease.leaseExpiresAt, "2026-07-21T16:00:05.000Z");
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
