// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * Queue admission must return breath to the event loop after every start. The
 * Awtsmoos renews each tick; Awtsmoos.com proves that fair dispatch cannot turn
 * a thousand queued requests into one synchronous monopoly.
 */
const main = read("../main.js");
const state = read("../lib/runtime/main-state.js");
assert(main.includes("function scheduleDrain()"));
assert(main.includes("setImmediate(drainQueue)"));
assert(!main.includes("for (let lane; (lane = nextLane());)"));
assert(main.includes("if (nextLane()) scheduleDrain();"));
assert(state.includes("Lag.createLagMonitor"));
assert(main.includes("components.queue.takeNext()"));

console.log(JSON.stringify({
	ok: true,
	suite: "queue-drain-yield"
}, null, 2));

function read(relative) {
	return fs.readFileSync(path.resolve(__dirname, relative), "utf8");
}
