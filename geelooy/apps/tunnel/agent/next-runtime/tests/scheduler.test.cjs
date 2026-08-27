// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Runtime = require("../index.js");
const F = require("./helpers/fixtures.cjs");

test("keyed serialization preserves one-key order and frees idle keys", async () => {
	const serial = Runtime.createKeyedSerial();
	const events = [];
	const gate = F.deferred();
	const first = serial.run("mission-a", async () => {
		events.push("first-start");
		await gate.promise;
		events.push("first-end");
	});
	const second = serial.run("mission-a", async () => events.push("second"));
	await new Promise(resolve => setImmediate(resolve));
	assert.deepEqual(events, ["first-start"]);
	gate.resolve();
	await Promise.all([first, second]);
	assert.deepEqual(events, ["first-start", "first-end", "second"]);
	assert.equal(serial.snapshot().keys, 0);
});

test("unrelated serialization keys run concurrently", async () => {
	const serial = Runtime.createKeyedSerial();
	const gate = F.deferred();
	let secondStarted = false;
	const first = serial.run("mission-a", () => gate.promise);
	const second = serial.run("mission-b", async () => { secondStarted = true; });
	await second;
	assert.equal(secondStarted, true);
	gate.resolve();
	await first;
});

test("P0 control starts while heavy capacity is saturated", async () => {
	const lanes = Runtime.createPriorityLanes({
		limits: {
			totalInflight: 1,
			inflight: { P0: 1, P1: 1, P2: 1, P3: 1, P4: 1, P5: 1 },
			queue: { P0: 10, P1: 10, P2: 10, P3: 10, P4: 10, P5: 10 }
		}
	});
	const heavyGate = F.deferred();
	const events = [];
	const heavy = lanes.submit("P4", async () => {
		events.push("heavy-start");
		await heavyGate.promise;
		events.push("heavy-end");
	});
	await new Promise(resolve => setImmediate(resolve));
	const control = lanes.submit("P0", async () => events.push("control"));
	await control;
	assert.deepEqual(events, ["heavy-start", "control"]);
	heavyGate.resolve();
	await heavy;
	assert.equal(lanes.snapshot().totalInflight, 0);
});

test("lane queue limits return structured overload", async () => {
	const gate = F.deferred();
	const lanes = Runtime.createPriorityLanes({
		limits: {
			totalInflight: 1,
			inflight: { P0: 1, P1: 1, P2: 1, P3: 1, P4: 1, P5: 1 },
			queue: { P0: 1, P1: 1, P2: 1, P3: 1, P4: 1, P5: 1 }
		}
	});
	const active = lanes.submit("P4", () => gate.promise);
	await new Promise(resolve => setImmediate(resolve));
	const queued = lanes.submit("P4", async () => true);
	await assert.rejects(lanes.submit("P4", async () => true), { code: "lane_overloaded" });
	gate.resolve();
	await Promise.all([active, queued]);
});
