// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DebugPortResolver } from "./DebugPortResolver.mjs";

test("offline requested port starts once and promotes the returned owner port", async () => {
	let starts = 0;
	const probes = [];
	const resolver = new DebugPortResolver({
		preferredPort: 9224,
		preferredAttempts: 3,
		preferredRetryMs: 0,
		sleep: async () => undefined,
		browserStarter: async port => {
			starts += 1;
			assert.equal(port, 9224);
			return { ok: true, debugPort: 9223 };
		},
		fetcher: async url => {
			const port = Number(new URL(url).port);
			probes.push(port);
			if (port === 9224) throw new Error("offline");
			return { ok: true, json: async () => ({ webSocketDebuggerUrl: "ws://browser" }) };
		}
	});
	assert.equal(await resolver.resolve(), 9223);
	assert.equal(resolver.status().activePort, 9223);
	assert.equal(starts, 1);
	assert.deepEqual(probes, [9224, 9223]);
});

test("watchdog refresh probes promoted port without restarting browser preparation", async () => {
	let starts = 0;
	const probes = [];
	const resolver = new DebugPortResolver({
		preferredPort: 9224,
		preferredRetryMs: 0,
		sleep: async () => undefined,
		browserStarter: async () => {
			starts += 1;
			return { ok: true, debugPort: 9223 };
		},
		fetcher: async url => {
			const port = Number(new URL(url).port);
			probes.push(port);
			if (port === 9224) throw new Error("offline");
			return { ok: true, json: async () => ({ webSocketDebuggerUrl: "ws://browser" }) };
		}
	});
	assert.equal(await resolver.resolve(), 9223);
	assert.equal(await resolver.resolve({ refresh: true }), 9223);
	assert.equal(await resolver.resolve({ refresh: true }), 9223);
	assert.equal(starts, 1);
	assert.deepEqual(probes, [9224, 9223, 9223, 9223]);
});
