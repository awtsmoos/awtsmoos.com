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
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING executor structured-error tests.
 */
process.once("disconnect", () => {
	process.exit(0);
});

if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_NO_READY !== "1") {
	process.send?.({ type: "ready" });
}

/** Executes exactly one parent-assigned action at a time. */
process.on("message", async message => {
	if (!message || message.type !== "execute") return;
	try {
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
	}
});

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
