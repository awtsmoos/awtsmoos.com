// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { PROJECT_CAPABILITIES } from "../../shared/workspace/projectCapabilities.js";
import { PLATFORM_BOUNDARIES, PLATFORM_PILLARS } from "../programs/project-command-center/catalog.js";
import { formatBytes, platformMetrics } from "../programs/project-command-center/metrics.js";
import { probeNativeRuntime } from "../programs/project-command-center/runtimeProbe.js";
import { createDriveWorkspaceEmbedConfiguration } from "../programs/drive-workspace/embedConfiguration.js";

/**
 * B"H
 * Witnesses Geelooy platform claims against one shared project testimony.
 * The Awtsmoos renews publication, data, compute, treasury, usage, and resource;
 * Awtsmoos.com keeps tenant isolation, trusted compute, gifting, purchased value, and metering explicitly separate.
 */

test("Command Center exposes every shared capability plus OS-only treasury vessels", () => {
	const sharedIds = PROJECT_CAPABILITIES.map(item => item.id);
	const pillarIds = PLATFORM_PILLARS.map(item => item.id);
	assert.equal(new Set(pillarIds).size, pillarIds.length);
	for (const id of sharedIds) assert.ok(pillarIds.includes(id), `Missing shared capability ${id}`);
	assert.ok(pillarIds.includes("wallet"));
	assert.ok(pillarIds.includes("usage"));
	assert.ok(pillarIds.includes("drives"));
	assert.equal(PLATFORM_PILLARS.length, PROJECT_CAPABILITIES.length + 3);

	const publish = PLATFORM_PILLARS.find(item => item.id === "publish");
	const compute = PLATFORM_PILLARS.find(item => item.id === "native-compute");
	const tenant = PLATFORM_PILLARS.find(item => item.id === "tenant-node");
	const wallet = PLATFORM_PILLARS.find(item => item.id === "wallet");
	assert.equal(publish?.state, "READY");
	assert.equal(publish?.action, "sites");
	assert.equal(compute?.state, "READY");
	assert.equal(compute?.action, "node-server");
	assert.equal(tenant?.state, "BLOCKED");
	assert.equal(wallet?.state, "LIVE TREASURY");
});

test("Command Center states publication, isolation, treasury, and billing boundaries", () => {
	const boundaries = PLATFORM_BOUNDARIES.join(" ");
	assert.match(boundaries, /Static Drive Sites.*live/i);
	assert.match(boundaries, /multi-tenant Node is blocked/i);
	assert.match(boundaries, /genuine OS\/container\/VM isolation provider/i);
	assert.match(boundaries, /full Node authority.*own.*Tunnel machine/i);
	assert.match(boundaries, /secret binding names/i);
	assert.match(boundaries, /secret values remain outside portable files/i);
	assert.match(boundaries, /promotional Perutas only/i);
	assert.match(boundaries, /purchased Perutas remain account-bound/i);
	assert.match(boundaries, /no cash-out/i);
	assert.match(boundaries, /record server-side usage/i);
	assert.match(boundaries, /separate charge path/i);
});

test("Drive workspace embed stays same-origin, depth-bounded, and sandboxed", () => {
	const configuration = createDriveWorkspaceEmbedConfiguration({
		locationObject: { href: "https://awtsmoos.test/os/?embedDepth=1", search: "?embedDepth=1" }
	});
	assert.equal(configuration.ok, true);
	const url = new URL(configuration.url);
	assert.equal(url.origin, "https://awtsmoos.test");
	assert.equal(url.pathname, "/apps/drive/");
	assert.equal(url.searchParams.get("embedParent"), "geelooy-os");
	assert.equal(configuration.depth, 2);
	assert.match(configuration.sandbox, /allow-scripts/);
	assert.doesNotMatch(configuration.sandbox, /allow-top-navigation/);
});

test("platform metrics aggregate supervised testimony", () => {
	const snapshots = new Map([
		[1, { network: { records: [{ bytesReceived: 1024 }, { bytesReceived: 2048 }] }, resources: { latest: { cpuMilliseconds: 12, memoryBytes: 4096, ioReadBytes: 500, ioWriteBytes: 700 } } }],
		[2, { network: { records: [{ bytesReceived: 512 }] }, resources: { latest: { cpuMilliseconds: 8, memoryBytes: 2048, ioReadBytes: 100, ioWriteBytes: 200 } } }]
	]);
	const metrics = platformMetrics({
		drives: { list: () => [{}, {}, {}] },
		vfs: { mounts: () => [{}, {}] },
		recentMutations: [{}, {}, {}, {}],
		processes: {
			list: () => [{ pid: 1, status: "running" }, { pid: 2, status: "stopped" }],
			telemetryFor: pid => ({ snapshot: () => snapshots.get(pid) })
		}
	});
	assert.deepEqual(metrics, {
		processCount: 2,
		runningProcesses: 1,
		driveCount: 3,
		vfsMountCount: 2,
		mutationCount: 4,
		networkRequests: 3,
		bytesReceived: 3584,
		cpuMilliseconds: 20,
		memoryBytes: 6144,
		ioReadBytes: 600,
		ioWriteBytes: 900
	});
	assert.equal(formatBytes(1536), "1.5 KB");
});

test("native runtime probe reports ready, auth, and unavailable states", async () => {
	const ready = await probeNativeRuntime(async () => response(200, { ok: true, capabilities: { launch: true } }));
	assert.equal(ready.state, "ready");
	const auth = await probeNativeRuntime(async () => response(401, { ok: false }));
	assert.equal(auth.state, "auth");
	const unavailable = await probeNativeRuntime(async () => response(503, { ok: false, error: { message: "adapter offline" } }));
	assert.equal(unavailable.state, "unavailable");
	assert.match(unavailable.label, /adapter offline/i);
});

function response(status, payload) {
	return {
		ok: status >= 200 && status < 300,
		status,
		async json() {
			return payload;
		}
	};
}
