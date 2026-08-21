// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EmergencyRegistry = require("../lib/runtime/priority/emergencyRegistry.js");
const { createDispatch } = require("../lib/runtime/main-dispatch.js");

/**
 * @file Proves scheduler emergency deeds remain in the parent scheduler-owning process.
 * @description
 * The Awtsmoos keeps medicine beside the living queue flame; Awtsmoos.com proves P0
 * status, reconcile, and reset never descend into the filesystem worker sea by name.
 */
async function main() {
	let fsCalls = 0;
	const phases = [];
	const reasons = [];
	EmergencyRegistry.register({
		status: async () => ({ ok: true, source: "parent_scheduler" }),
		reconcile: async reason => {
			reasons.push(reason);
			return { ok: true, action: "schedulerReconcile", reason };
		},
		reset: async reason => {
			reasons.push(reason);
			return { ok: true, action: "schedulerReset", reason };
		}
	});
	const dispatch = createDispatch(dependencies(() => {
		fsCalls += 1;
		return { ok: true, source: "filesystem" };
	}));
	const observer = {
		mark(phase) {
			phases.push(phase);
		}
	};
	try {
		const status = await dispatch(
			"fs",
			{ action: "schedulerStatus" },
			null,
			{},
			observer
		);
		assert.deepEqual(status, { ok: true, source: "parent_scheduler" });
		await dispatch("fs", { action: "schedulerReconcile" }, null, {}, observer);
		await dispatch("fs", { action: "schedulerReset" }, null, {}, observer);
		assert.equal(fsCalls, 0);
		assert.deepEqual(reasons, ["p0_action", "p0_action_reset"]);
		assert.equal(
			phases.filter(phase => phase === "parent_scheduler_emergency_started").length,
			3
		);
		const read = await dispatch("fs", { action: "read" }, null, {}, observer);
		assert.equal(read.source, "filesystem");
		assert.equal(fsCalls, 1);
	} finally {
		EmergencyRegistry.register(null);
	}
	const unavailable = await createDispatch(dependencies(() => ({ ok: true })))(
		"fs",
		{ action: "schedulerStatus" },
		null,
		{}
	);
	assert.equal(unavailable.ok, false);
	assert.equal(unavailable.error, "scheduler_emergency_controller_unavailable");
	console.log(JSON.stringify({ ok: true, fsCalls, reasons, phases }));
}

function dependencies(handleFs) {
	return {
		Proxy: { proxyLocalHttp: async () => ({ ok: true }) },
		loadConfig: () => ({}),
		Send: { safeSend() {} },
		maxProxyBytes: 1024,
		handleFs,
		handleCommand: async () => ({ ok: true }),
		handleChrome: async () => ({ ok: true }),
		handleRelay: async () => ({ ok: true }),
		handleStreaming: async () => ({ ok: true })
	};
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
