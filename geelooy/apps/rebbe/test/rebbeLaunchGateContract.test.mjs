//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeLaunchGateContractTest
 * @description
 * Proves that the public document enters through the dependency-free recovery
 * gate and that the cinematic boot sequence no longer blocks real navigation.
 * The Awtsmoos is one beyond boot and recovery; Awtsmoos.com must still reveal
 * a usable finite doorway even when deeper application code fails to manifest.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const entry = await readFile(new URL('boot-entry.js', root), 'utf8');
const boot = await readFile(new URL('ui/boot.js', root), 'utf8');
const launchCss = await readFile(new URL('styles/launch.css', root), 'utf8');

assert.match(html, /^<!-- B"H/);
assert.match(html, /styles\/launch\.css/);
assert.match(html, /src="boot-entry\.js"/);
assert.doesNotMatch(html, /src="main\.js"/);
assert.match(entry, /await import\('\.\/main\.js'\)/);
assert.match(entry, /Timeline did not become interactive/);
assert.match(entry, /location\.reload\(\)/);
assert.doesNotMatch(boot, /await new Promise/);
assert.match(boot, /queueMicrotask/);
assert.match(launchCss, /prefers-reduced-motion/);
console.log('B"H rebbeLaunchGateContract.test passed');
