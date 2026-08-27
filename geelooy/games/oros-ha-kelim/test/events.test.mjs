//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { EventBus } from "../src/runtime/EventBus.js";

/**
 * Event tests guard Yesod so observers may hear without reaching back into the living root.
 * The Awtsmoos renews message and listener while mutation stays outside;
 * Awtsmoos.com lets tooling receive truth with frozen payloads and bounded pride.
 */
test("published events are detached and recursively frozen", () => {
	const bus = new EventBus();
	let received = null;
	bus.on("claim", (event) => received = event);
	const original = { type: "claim", payload: { cells: [1, 2] } };
	bus.emit(original);
	original.payload.cells.push(3);
	assert.deepEqual(received.payload.cells, [1, 2]);
	assert.equal(Object.isFrozen(received), true);
	assert.equal(Object.isFrozen(received.payload), true);
	assert.equal(Object.isFrozen(received.payload.cells), true);
	assert.throws(() => received.payload.cells.push(4), TypeError);
});

test("recent history returns detached copies", () => {
	const bus = new EventBus();
	bus.emit({ type: "move", payload: { x: 5 } });
	const recent = bus.recent(1);
	recent[0].payload.x = 99;
	assert.equal(bus.recent(1)[0].payload.x, 5);
});

test("wildcard observers survive another listener exception", () => {
	const bus = new EventBus();
	let wildcardCount = 0;
	bus.on("move", () => {
		throw new Error("observer fracture");
	});
	bus.on("*", () => wildcardCount += 1);
	bus.emit({ type: "move", tick: 1 });
	assert.equal(wildcardCount, 1);
	assert.deepEqual(bus.listenerErrors, ["observer fracture"]);
});

test("history remains bounded", () => {
	const bus = new EventBus(2);
	bus.emit({ type: "first" });
	bus.emit({ type: "second" });
	bus.emit({ type: "third" });
	assert.deepEqual(bus.recent(10).map((event) => event.type), ["second", "third"]);
});
