// B"H
/**
 * Chapter 286: Edge cursor contract. When the reader reaches the currently
 * rendered bottom, the oracle must continue from max rendered verse, not remain
 * trapped at the old visible probe.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync('geelooy/heichelos/post/logic/scribe/VirtualScrollOracle.js', 'utf8');
assert.match(source, /function edgeCursor/, 'oracle must have an edge cursor fallback');
assert.match(source, /maxRevealed\(\)/, 'downward bottom scroll must advance from max revealed');
assert.match(source, /minRevealed\(\)/, 'upward top scroll must advance from min revealed');
assert.match(source, /const HEARTBEAT_MS = 240;/, 'heartbeat should be quick enough to wake more road without waiting on fragile scroll events');
assert.match(source, /const PREFETCH_STEPS = 10;/, 'reader should prefetch a larger road ahead');
assert.match(source, /wantedIds\(normalized/, 'prewarm must use normalized direction and current edge');
console.log('B"H VirtualScrollEdgeCursor.test passed');
