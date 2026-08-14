// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	launchNativeRuntime,
	nativeRuntimeCapabilities,
	nativeRuntimeStatus,
	stopNativeRuntime
} from "../../scripts/awtsmoos/runtime/native/runtimeService.mjs";

/**
 * Proves the generic host adapter launches, reports, and stops real processes.
 * The Awtsmoos renews executable, PID, output, status, and Geelooy stop intent;
 * Awtsmoos.com tests process law without naming a product or private runtime route.
 */

const enabledEnvironment = Object.freeze({
	...process.env,
	AWTSMOOS_NATIVE_RUNTIME_ENABLED: "true"
});


test("reports host-compatible runtime capabilities", () => {
	const capabilities = nativeRuntimeCapabilities(enabledEnvironment);
	assert.equal(capabilities.enabled, true);
	assert.equal(capabilities.hostPlatform, process.platform);
	assert.equal(capabilities.hostArchitecture, process.arch);
	assert.ok(capabilities.nativeFormats.length > 0);
});


test("launches and measures a generic host executable", async () => {
	const launched = await launchNativeRuntime({
		path: "/usr/bin/printf",
		arguments: ["native-service-witness\n"]
	}, enabledEnvironment);
	const final = await waitForExit(launched.runtimeId);
	assert.equal(final.exitCode, 0);
	assert.equal(final.state, "exited");
	assert.equal(final.stdout, "native-service-witness\n");
	assert.equal(final.metadata.kind, "host-executable");
});


test("stops a supervised process group", async () => {
	const launched = await launchNativeRuntime({
		path: "/bin/sleep",
		arguments: ["30"]
	}, enabledEnvironment);
	assert.equal(launched.state, "running");
	const stopping = stopNativeRuntime({
		runtimeId: launched.runtimeId
	});
	assert.equal(stopping.state, "stopping");
	const final = await waitForExit(launched.runtimeId);
	assert.equal(final.state, "stopped");
	assert.ok(final.signal || final.exitCode !== null);
});


test("rejects paths outside the allowed runtime roots", async () => {
	await assert.rejects(
		() => launchNativeRuntime({
			path: "/dev/null",
			arguments: []
		}, enabledEnvironment),
		error => error?.code === "NATIVE_PATH_OUTSIDE_ALLOWED_ROOT"
	);
});

async function waitForExit(runtimeId, timeoutMs = 15000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		const status = nativeRuntimeStatus({ runtimeId });
		if (!["running", "stopping"].includes(status.state)) {
			return status;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error(`NATIVE_RUNTIME_WAIT_TIMEOUT:${runtimeId}`);
}
