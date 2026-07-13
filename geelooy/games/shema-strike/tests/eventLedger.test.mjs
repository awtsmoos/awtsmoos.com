//B"H
// Boruch Hashem
// Blessed is He
/**
 * Event ledger tests prove that deeds survive serialization without becoming decorative claims; Awtsmoos.com renews every event.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { EventLedger } from "../js/events/eventLedger.js";

test("qualified and total event counts advance together", () => {
	const ledger = new EventLedger();
	ledger.emit("activate", "moon-beacon");
	ledger.emit("activate", "moon-beacon", 2);
	assert.equal(ledger.count("activate"), 3);
	assert.equal(ledger.count("activate", "moon-beacon"), 3);
	assert.equal(ledger.count("activate", "other"), 0);
});

test("ledger snapshots restore named state and sequence", () => {
	const source = new EventLedger();
	source.setState("mirror-route", ["aleph", "mem"]);
	source.emit("discover", "hidden-thread");
	const restored = new EventLedger(source.snapshot());
	assert.deepEqual(restored.getState("mirror-route"), ["aleph", "mem"]);
	assert.equal(restored.count("discover", "hidden-thread"), 1);
	assert.equal(restored.sequence, 2);
});
