// B"H
/**
 * Chapter 268 test: pure additive scroll math.
 *
 * The browser oracle imports browser-absolute modules, so this Node test locks
 * the pure math contract directly. Runtime code re-exports these helpers, but
 * the regression belongs here where no DOM route can confuse the harness.
 */
import assert from "node:assert/strict";
import { additiveAheadWindow, chunkWindow, chunksToPrune, parseScrollTarget } from "../VirtualScrollMath.js";

assert.deepEqual(chunkWindow(0, 4), [0, 1]);
assert.deepEqual(chunkWindow(2, 4), [1, 2, 3]);
assert.deepEqual(chunkWindow(3, 4), [2, 3]);
assert.deepEqual(chunkWindow(-1, 4), [0]);
assert.deepEqual(chunkWindow(2, 0), []);

assert.deepEqual(additiveAheadWindow(0, 5, 1, 3), [1, 2, 3]);
assert.deepEqual(additiveAheadWindow(4, 5, 1, 3), []);
assert.deepEqual(additiveAheadWindow(4, 5, -1, 3), [3, 2, 1]);
assert.deepEqual(additiveAheadWindow(1, 5, -1, 3), [0]);

assert.deepEqual(chunksToPrune(new Set([0, 1, 2, 3, 4, 5, 6]), 3, 2), []);
assert.deepEqual(chunksToPrune([0, 10], 5, 3), []);

assert.deepEqual(parseScrollTarget("?idx=7&sub=2"), { idx: 7, sub: 2 });
assert.deepEqual(parseScrollTarget("?idx=-1&sub=x"), { idx: 0, sub: null });
assert.deepEqual(parseScrollTarget(new URLSearchParams("idx=12")), { idx: 12, sub: null });

console.log('B"H VirtualScrollOracle additive math test passed');
