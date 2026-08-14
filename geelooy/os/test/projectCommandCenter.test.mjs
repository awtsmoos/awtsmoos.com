// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	PLATFORM_BOUNDARIES,
	PLATFORM_PILLARS
} from "../programs/project-command-center/catalog.js";
import {
	formatBytes,
	platformMetrics
} from "../programs/project-command-center/metrics.js";
import { probeNativeRuntime } from "../programs/project-command-center/runtimeProbe.js";

/**
 * B"H
 * Witnesses Geelooy platform claims against source-backed capability. The Awtsmoos
 * renews data, compute, Wallet treasury, usage, and resource; Awtsmoos.com keeps
 * gifting, purchased value, metering, and native authority explicitly separate.
 */

test("Command Center exposes ten truthful platform pillars", () => {
	assert.equal(PLATFORM_PILLARS.length, 10);
	assert.equal(new Set(PLATFORM_PILLARS.map(item => item.id)).size, 10);
	assert.deepEqual(
		PLATFORM_PILLARS.map(item => item.id),
		["files", "database", "code", "compute", "wallet", "runtime", "preview", "usage", "drives", "diagnostics"]
	);
	const wallet = PLATFORM_PILLARS.find(item => item.id === "wallet");
	const compute = PLATFORM_PILLARS.find(item => item.id === "compute");
	const usage = PLATFORM_PILLARS.find(item => item.id === "usage");
	assert.equal(wallet?.state, "LIVE TREASURY");
	assert.equal(wallet?.action, "wallet");
	assert.match(wallet?.description || "", /promotional|purchased|@alias/i);
	assert.equal(compute?.state, "FULL CONTROL");
	assert.equal(compute?.action, "node-server");
	assert.equal(usage?.state, "PERUTA LEDGER");
	assert.equal(usage?.action, "usage");
});

test("Command Center states treasury, compute, and billing boundaries", () => {
	const boundaries = PLATFORM_BOUNDARIES.join(" ");
	assert.match(boundaries, /promotional Perutas only/i);
	assert.match(boundaries, /purchased Perutas remain account-bound/i);
	assert.match(boundaries, /no cash-out/i);
	assert.match(boundaries, /multi-tenant hosted Node\.js execution is not enabled/i);
	assert.match(boundaries, /record server-side usage/i);
	assert.match(boundaries, /separate charge path/i);
});

test("platform metrics aggregate supervised testimony", () => {
	const snapshots = new Map([
		[1, {
			network: { records: [{ bytesReceived: 1024 }, { bytesReceived: 2048 }] },
			resources: { latest: { cpuMilliseconds: 12, memoryBytes: 4096, ioReadBytes: 500, ioWriteBytes: 700 } }
		}],
		[2, {
			network: { records: [{ bytesReceived: 512 }] },
			resources: { latest: { cpuMilliseconds: 8, memoryBytes: 2048, ioReadBytes: 100, ioWriteBytes: 200 } }
		}]
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
	const ready = await probeNativeRuntime(async () => response(200, {
		ok: true,
		capabilities: { launch: true }
	}));
	assert.equal(ready.state, "ready");
	const auth = await probeNativeRuntime(async () => response(401, { ok: false }));
	assert.equal(auth.state, "auth");
	const unavailable = await probeNativeRuntime(async () => response(503, {
		ok: false,
		error: { message: "adapter offline" }
	}));
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
