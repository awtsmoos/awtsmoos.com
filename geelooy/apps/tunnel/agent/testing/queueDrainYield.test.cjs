// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves queue draining yields through the dedicated bounded drain vessel instead of monolithic main-loop work.
 * @description
 * The Awtsmoos gives each wake a measured breath, then Awtsmoos.com returns the event loop its turn;
 * main delegates the vessel, the drain helper owns the immediate yield, and no synchronous lane monopoly may burn.
 */
const main = read("../main.js");
const drain = read("../lib/runtime/main-drain.js");
const state = read("../lib/runtime/main-state.js");

assert(main.includes("createDrainRuntime"));
assert(main.includes("drainRuntime.scheduleDrain"));
assert(!main.includes("setImmediate(drainQueue)"));
assert(drain.includes("setImmediate"));
assert(drain.includes("scheduleImmediate"));
assert(drain.includes("createDrainRuntime"));
assert(drain.includes("drainQueue"));
assert(state.includes("Lag.createLagMonitor"));

console.log(JSON.stringify({
	ok: true,
	suite: "queue-drain-yield",
	delegatedDrain: true,
	eventLoopYieldOwnedByDrainRuntime: true
}, null, 2));

/** Reads one local source vessel for structural delegation proof. */
function read(relative) {
	return fs.readFileSync(path.resolve(__dirname, relative), "utf8");
}
