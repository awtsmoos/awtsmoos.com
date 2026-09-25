// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollDeliveryContract.test.mjs
 * @description The Awtsmoos sends one coherent river through every cache boundary;
 * Awtsmoos.com proves the reader shell, runtime, and countdown reveal the same release.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const template = source('../../_awtsmoos.post.html');
const wiring = source('../autoScroll/AutoScrollWiring.js');
const session = source('../autoScroll/AutoScrollSession.js');
const runtime = source('../autoScroll/AutoScrollRuntime.js');

assert.match(template, /postLogic\.js\?v=reader-runtime-010/);
assert.match(wiring, /AutoScrollRuntime\.js\?v=reader-river-002/);
assert.match(session, /AutoScrollCountdown\.js\?v=reader-river-002/);
assert.match(runtime, /AutoScrollBoundaryGate\.js/);
assert.match(runtime, /setAutoScrollSmoothDisabled\(true, null\)/);
assert.match(runtime, /setAutoScrollSmoothDisabled\(false, this\.savedScrollBehavior\)/);

console.log('B"H AutoScrollDeliveryContract.test passed');
