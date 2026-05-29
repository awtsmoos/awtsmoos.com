// B"H
/**
 * Chapter 3 test: the scroll oracle must know which chunks surround the reader,
 * which distant chunks may sleep, and how a refreshed URL points back home.
 */
import assert from "node:assert/strict";
import { chunkWindow, chunksToPrune, parseScrollTarget } from "../VirtualScrollOracle.js";

assert.deepEqual(chunkWindow(0, 4), [0, 1]);
assert.deepEqual(chunkWindow(2, 4), [1, 2, 3]);
assert.deepEqual(chunkWindow(3, 4), [2, 3]);
assert.deepEqual(chunkWindow(-1, 4), [0]);
assert.deepEqual(chunkWindow(2, 0), []);

assert.deepEqual(chunksToPrune(new Set([0, 1, 2, 3, 4, 5, 6]), 3, 2), [0, 6]);
assert.deepEqual(chunksToPrune([1, 2, 3], 2, 1), []);
assert.deepEqual(chunksToPrune([0, 10], 5, 3), [0, 10]);

assert.deepEqual(parseScrollTarget("?idx=7&sub=2"), { idx: 7, sub: 2 });
assert.deepEqual(parseScrollTarget("?idx=-1&sub=x"), { idx: 0, sub: null });
assert.deepEqual(parseScrollTarget(new URLSearchParams("idx=12")), { idx: 12, sub: null });

console.log('B"H VirtualScrollOracle.test passed');
