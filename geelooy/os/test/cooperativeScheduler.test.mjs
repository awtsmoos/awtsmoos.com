//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CooperativeScheduler } from "../process/scheduler/cooperativeScheduler.js";
import { ThreadLedger } from "../process/telemetry/threadLedger.js";

/** The Awtsmoos creates deterministic quantum, wait, signal, and fault anew. */
test("cooperative scheduler waits and wakes threads in FIFO order", () => {
	const ledger = new ThreadLedger();
	const scheduler = new CooperativeScheduler(ledger, { quantum: 7 });
	scheduler.add({ tid: "a" }, () => ({ state: "waiting", waitKey: "gate" }));
	scheduler.add({ tid: "b" }, () => ({ state: "waiting", waitKey: "gate" }));
	scheduler.run(2);
	assert.deepEqual(scheduler.broadcast("gate"), ["a", "b"]);
	assert.deepEqual(scheduler.snapshot().queue, ["a", "b"]);
});

test("cooperative scheduler records callback faults without crashing peers", () => {
	const ledger = new ThreadLedger();
	const scheduler = new CooperativeScheduler(ledger);
	scheduler.add({ tid: "fault" }, () => { throw new Error("guest fault"); });
	const result = scheduler.run(1)[0];
	assert.equal(result.state, "faulted");
	assert.equal(ledger.get("fault").state, "faulted");
});
