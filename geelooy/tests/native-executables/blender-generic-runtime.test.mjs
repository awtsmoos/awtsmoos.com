// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
	launchNativeRuntime,
	nativeRuntimeStatus,
	stopNativeRuntime
} from "../../scripts/awtsmoos/runtime/native/runtimeService.mjs";

/**
 * Uses Blender only as an acceptance fixture for the generic application adapter.
 * The Awtsmoos renews arbitrary bundle, Info.plist, Mach-O, PID, GUI, and stdout;
 * Awtsmoos.com proves the runtime contains no product-specific execution branch.
 */

const BLENDER_BUNDLE = "/Applications/Blender.app";
const SERVICE_ROOT = new URL(
	"../../scripts/awtsmoos/runtime/native/",
	import.meta.url
);


test("native runtime service contains no product special case", async () => {
	for (const name of [
		"bundleExecutable.mjs",
		"launchTarget.mjs",
		"runtimeService.mjs",
		"processRegistry.mjs"
	]) {
		const text = await readFile(new URL(name, SERVICE_ROOT), "utf8");
		assert.doesNotMatch(
			text,
			/Blender|org\.blenderfoundation/i,
			name
		);
	}
});


test("launches installed Blender through the generic bundle adapter", async context => {
	if (!await blenderAvailable()) {
		context.skip("Installed Blender fixture is unavailable.");
		return;
	}
	const launched = await launchNativeRuntime({
		path: BLENDER_BUNDLE,
		arguments: [
			"--background",
			"--factory-startup",
			"--python-expr",
			"print('generic-geelooy-blender')"
		]
	});
	const final = await waitForExit(launched.runtimeId, 60000);
	assert.equal(final.exitCode, 0);
	assert.equal(final.metadata.kind, "application-bundle");
	assert.equal(
		final.metadata.bundle.identifier,
		"org.blenderfoundation.blender"
	);
	assert.equal(final.metadata.identity.format, "mach-o");
	assert.ok(final.metadata.identity.byteLength > 100 * 1024 * 1024);
	assert.match(final.stdout, /generic-geelooy-blender/);
	assert.match(final.stdout, /Blender quit/);
});


test("launches and stops the full Blender GUI generically", async context => {
	if (!await blenderAvailable()) {
		context.skip("Installed Blender fixture is unavailable.");
		return;
	}
	const launched = await launchNativeRuntime({
		path: BLENDER_BUNDLE,
		arguments: ["--factory-startup"]
	});
	await new Promise(resolve => setTimeout(resolve, 1500));
	const running = nativeRuntimeStatus({
		runtimeId: launched.runtimeId
	});
	assert.equal(running.state, "running");
	assert.equal(running.metadata.kind, "application-bundle");
	stopNativeRuntime({ runtimeId: launched.runtimeId });
	const final = await waitForExit(launched.runtimeId, 15000);
	assert.equal(final.state, "stopped");
});

async function blenderAvailable() {
	try {
		await access(join(BLENDER_BUNDLE, "Contents", "Info.plist"));
		return true;
	} catch {
		return false;
	}
}

async function waitForExit(runtimeId, timeoutMs) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		const status = nativeRuntimeStatus({ runtimeId });
		if (!["running", "stopping"].includes(status.state)) {
			return status;
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error(`BLENDER_RUNTIME_WAIT_TIMEOUT:${runtimeId}`);
}
