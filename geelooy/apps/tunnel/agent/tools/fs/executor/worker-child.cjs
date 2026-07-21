// B"H

process.env.AWTSMOOS_FS_EXECUTOR_CHILD = "1";

const { handleFsAction } = require("../actions.js");

process.send?.({ type: "ready" });

/** Executes exactly one parent-assigned action at a time. */
process.on("message", async message => {
	if (!message || message.type !== "execute") return;
	try {
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
			stack: error.stack
		});
	}
});

function testBlock(payload = {}) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE !== "1") return false;
	if (payload.action !== "executorTestBlock") return false;
	const durationMs = Math.max(0, Math.min(5000, Number(payload.blockMs || 0)));
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, durationMs);
	return true;
}
