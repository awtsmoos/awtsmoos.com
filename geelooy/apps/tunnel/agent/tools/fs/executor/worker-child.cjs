// B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_FS_EXECUTOR_CHILD = "1";

const { handleFsAction } = require("../actions.js");
const FsError = require("../filesystemError.js");

/**
 * @file Executes isolated work and exposes bounded failure injection only in test mode.
 * @description
 * The Awtsmoos gives this child one parent and one purpose. Awtsmoos.com preserves
 * parent-disconnect custody and safe error projection, while tests may deliberately
 * return an error, freeze, or shatter one vessel so healing is proven by distinction.
 *
 * Item 34 — cooperative cancellation: the parent may send { type: "cancel", id }
 * for the in-flight job. The child records the abort flag; batch-oriented work
 * checks it between batches and aborts cleanly with FS_EXECUTOR_CANCELLED. A
 * cancel that arrives mid-handleFsAction is honored right after the action
 * resolves by reporting cancelled instead of the result.
 *
 * Item 36 — progress reporting: batch-oriented work may call reportProgress(id,
 * phase, done, total); the parent throttles to one mark per job per second.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING executor structured-error tests.
 */
process.once("disconnect", () => {
	process.exit(0);
});

if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_NO_READY !== "1") {
	process.send?.({ type: "ready" });
}

let execCount = 0;
let currentJob = null;

/** Executes exactly one parent-assigned action at a time. */
process.on("message", async message => {
	if (!message) return;
	if (message.type === "cancel") {
		if (currentJob && message.id === currentJob.id) currentJob.abort.cancelled = true;
		return;
	}
	if (message.type !== "execute") return;
	execCount += 1;
	const abort = { cancelled: false };
	currentJob = { id: message.id, abort };
	try {
		if (await testControlAction(message.payload, message.id, abort)) return;
		const familyResult = testFamilyResult(message.payload);
		if (familyResult) {
			process.send?.({ id: message.id, ok: true, result: familyResult });
			return;
		}
		if (testBlock(message.payload)) {
			process.send?.({
				id: message.id,
				ok: true,
				result: { ok: true, action: "executorTestBlock" }
			});
			return;
		}
		const result = await handleFsAction(message.payload || {}, null);
		if (abort.cancelled) {
			process.send?.({
				id: message.id,
				ok: false,
				code: "FS_EXECUTOR_CANCELLED",
				error: "fs_executor_cancelled"
			});
			return;
		}
		process.send?.({ id: message.id, ok: true, result });
	} catch (error) {
		process.send?.({
			id: message.id,
			ok: false,
			error: error.message,
			code: error.code || "FS_EXECUTOR_ACTION_FAILED",
			stack: error.stack,
			filesystem: FsError.transport(error)
		});
	} finally {
		if (currentJob && currentJob.id === message.id) currentJob = null;
	}
});

/** Emits one throttled-by-the-parent progress mark for batch-oriented work. */
function reportProgress(id, phase, done, total) {
	process.send?.({ type: "progress", id, phase, done, total });
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Test-only control actions (AWTSMOOS_FS_EXECUTOR_TEST_MODE=1). Returns true
 * when the action was handled here; real actions fall through to the normal path.
 */
async function testControlAction(payload = {}, id, abort) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE !== "1") return false;
	const action = payload.action;
	if (action === "executorTestExecCount") {
		process.send?.({ id, ok: true, result: { ok: true, action, execCount } });
		return true;
	}
	if (action === "executorTestProgress") {
		await testBatchedProgress(payload, id, abort, false);
		return true;
	}
	if (action === "executorTestCancellable") {
		await testBatchedProgress(payload, id, abort, true);
		return true;
	}
	if (action === "executorTestBloat") {
		testBloat(payload, id);
		return true;
	}
	if (action === "executorTestHugeResult") {
		const bytes = Math.max(1, Math.min(64 * 1024 * 1024, Number(payload.bytes || 0)));
		process.send?.({
			id,
			ok: true,
			result: { ok: true, action, blob: "x".repeat(bytes) }
		});
		return true;
	}
	if (action === "executorTestWrite") {
		testWrite(payload, id);
		return true;
	}
	return false;
}

/** Cooperative batch loop: emits progress per batch, aborts between batches when cancellable. */
async function testBatchedProgress(payload = {}, id, abort, cancellable) {
	const batches = Math.max(1, Math.min(60, Number(payload.batches || 6)));
	const batchMs = Math.max(0, Math.min(2000, Number(payload.batchMs || 350)));
	for (let done = 1; done <= batches; done += 1) {
		await delay(batchMs);
		if (cancellable && abort.cancelled) {
			process.send?.({
				id,
				ok: false,
				code: "FS_EXECUTOR_CANCELLED",
				error: "fs_executor_cancelled_cooperative"
			});
			return;
		}
		reportProgress(id, "batch", done, batches);
	}
	process.send?.({ id, ok: true, result: { ok: true, action: payload.action, batches } });
}

/**
 * Item 61 test hook: tries to allocate targetMb megabytes. With the parent's
 * --max-old-space-size enforced the child OOM-crashes quickly (proving the
 * limit); without the flag it would allocate the full target and reply, so the
 * test fails loudly instead of hanging.
 */
function testBloat(payload = {}, id) {
	const targetMb = Math.max(16, Math.min(1024, Number(payload.megabytes || 256)));
	const chunks = [];
	const oneMb = "x".repeat(1024 * 1024);
	for (let index = 0; index < targetMb; index += 1) {
		chunks.push(oneMb + index);
	}
	process.send?.({
		id,
		ok: true,
		result: { ok: true, action: "executorTestBloat", allocatedMb: targetMb, chunks: chunks.length }
	});
}

/**
 * Write-family test double: performs a real filesystem write (marker file),
 * then optionally kills the worker. Deliberately NOT on the safe-retry
 * allowlist, so the idempotency tests can prove writes are never auto-retried.
 */
function testWrite(payload = {}, id) {
	const marker = String(payload.markerPath || "");
	if (marker) {
		require("node:fs").writeFileSync(marker, `executorTestWrite:${Date.now()}\n`);
	}
	if (payload.exitWorker === true) {
		process.exit(Math.max(1, Math.min(125, Number(payload.exitCode || 97))));
	}
	process.send?.({ id, ok: true, result: { ok: true, action: "executorTestWrite", marker } });
}

/** Provides one stable test family with healthy, business-error, and exit outcomes. */
function testFamilyResult(payload = {}) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE !== "1") return null;
	if (payload.action !== "executorTestFamily") return null;
	if (payload.businessError === true) {
		const error = new Error("executor_test_business_error");
		error.code = "EXECUTOR_TEST_BUSINESS_ERROR";
		throw error;
	}
	if (payload.exitWorker === true) {
		process.exit(Math.max(1, Math.min(125, Number(payload.exitCode || 97))));
	}
	return {
		ok: true,
		action: "executorTestFamily",
		healed: true
	};
}

function testBlock(payload = {}) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE !== "1") return false;
	if (payload.action !== "executorTestBlock") return false;
	const durationMs = Math.max(0, Math.min(5000, Number(payload.blockMs || 0)));
	Atomics.wait(
		new Int32Array(new SharedArrayBuffer(4)),
		0,
		0,
		durationMs
	);
	return true;
}
