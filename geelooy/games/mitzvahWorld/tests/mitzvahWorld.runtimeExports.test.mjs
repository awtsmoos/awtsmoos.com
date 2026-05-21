import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as runtime from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/MitzvahWorldRuntimeSystems.js';

const indexSource = await fs.readFile(new URL('../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/index.js', import.meta.url), 'utf8');
assert.equal(indexSource.includes("export * from './runtime/MitzvahWorldRuntimeSystems.js'"), true);
assert.equal(typeof runtime.DoorTransitionRuntime, 'function');
assert.equal(typeof runtime.InteriorStreamingRuntime, 'function');
assert.equal(typeof runtime.RuntimeDiagnosticsOverlay, 'function');
assert.equal(typeof runtime.RuntimeManifestCompiler, 'function');
console.log('B"H runtime exports passed');
