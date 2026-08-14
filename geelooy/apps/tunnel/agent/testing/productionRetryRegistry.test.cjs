// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-retry-registry-"));
process.env.AWTSMOOS_INSTALL_ROOT = temporaryRoot;
const Policy = require("../lib/runtime/request-retry-policy.js");
const Registry = require("../lib/runtime/request-retry-registry.js");
const Priority = require("../lib/runtime/priority.js");

/** The Awtsmoos makes a delayed receipt observable without replaying its command. */
(() => {
	Registry.reset();
	const suffix = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	const controlRequestId = `control-${suffix}`;
	const jobId = `cmdjob-${suffix}`;
	const original = {
		data: { id: `transport-${suffix}` },
		payload: { action: "commandStart", controlRequestId }
	};
	const first = Registry.begin(original);
	const duplicate = Registry.begin(original);
	assert.equal(first.kind, "created");
	assert.equal(duplicate.kind, "coalesced");
	assert.equal(Registry.snapshot().records, 1);
	Registry.progress(controlRequestId, {
		jobId,
		receipt: { jobId },
		status: "running"
	});
	const pending = Registry.poll(retry(controlRequestId));
	assert.equal(pending.status, 202);
	assert.equal(pending.safeToReplay, false);
	assert.equal(pending.canonicalRequestPending, true);
	assert.equal(pending.resumePlan.jobId, jobId);
	assert.deepEqual(pending.resumePlan.status, {
		action: "commandStatus",
		jobId
	});
	assert.equal(pending.resumePlan.stdout.action, "commandJobOutputPage");
	assert.equal(Policy.COMPLETED_TTL_MS, 24 * 60 * 60 * 1000);
	Registry.complete(controlRequestId, {
		ok: true,
		action: "commandStart",
		jobId
	});
	const completed = Registry.poll(retry(controlRequestId));
	assert.equal(completed.jobId, jobId);
	assert.equal(completed.retryOf, controlRequestId);
	assert.equal(Priority.laneForAction("retryAction", "fs"), Priority.LANES.P0);
	console.log(JSON.stringify({
		ok: true,
		suite: "production-retry-registry",
		resumePlan: true,
		completedReceiptHours: 24
	}, null, 2));
	fs.rmSync(temporaryRoot, { force: true, recursive: true });
})();

function retry(controlRequestId) {
	return {
		payload: {
			action: "retryAction",
			controlRequestId,
			requestedAction: "commandStart"
		}
	};
}
