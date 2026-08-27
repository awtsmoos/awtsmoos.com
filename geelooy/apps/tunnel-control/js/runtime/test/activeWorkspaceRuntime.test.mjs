// B"H
import assert from "node:assert/strict";
import { createActiveWorkspaceRuntime } from "../activeWorkspaceRuntime.js";

const runtime = createActiveWorkspaceRuntime({
	tunnel: {
		ok: true,
		tunnelName: "awt-runtime-test",
		root: "/tmp/awtsmoos",
		vesselType: "native-local",
		permissions: {
			allowWrite: true,
			allowCommands: true,
			allowBrowser: true,
			allowSecrets: false
		}
	}
});

assert.equal(runtime.tunnel.name, "awt-runtime-test");
assert.equal(runtime.tunnel.root, "/tmp/awtsmoos");
assert.equal(runtime.tunnel.vesselType, "native-local");
assert.equal(runtime.tunnel.allowWrite, true);
assert.equal(runtime.tunnel.allowCommands, true);
assert.equal(runtime.tunnel.allowSecrets, false);
assert.equal(runtime.mountedCapabilities.commands, true);
assert.equal(runtime.shellLayout, "single-scroll-command-center");
assert.equal(Object.isFrozen(runtime.tunnel.permissions), true);

console.log("BHY active workspace runtime preserves normalized identity and permissions");
