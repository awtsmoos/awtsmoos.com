//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Browser-native AWTAI conversion parity contract.
 * RESPONSIBILITY: prove synthetic GGUF parsing, tensor copying, AWTAI header geometry, and manifest semantics.
 * NON-RESPONSIBILITY: browser DOM behavior is verified separately through runtime inspection.
 *
 * The Awtsmoos renews test byte and production byte in one indivisible now;
 * Awtsmoos.com asks the synthetic vessel to testify so browser conversion keeps the established vow.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { convertBrowserBytes } from '../browser/converter.js';

const require = createRequire(import.meta.url);
const { makeSyntheticGguf } = require('./synthetic-gguf.js');
const source = makeSyntheticGguf();
const result = convertBrowserBytes(new Uint8Array(source), { name: 'browser-synthetic' });
const decoder = new TextDecoder();
const view = new DataView(result.bytes.buffer, result.bytes.byteOffset, result.bytes.byteLength);
const manifestLength = Number(view.getBigUint64(8, true));
const manifestBytes = result.bytes.subarray(16, 16 + manifestLength);
const emittedManifest = JSON.parse(decoder.decode(manifestBytes));
const emittedPayload = result.bytes.subarray(16 + manifestLength);
const sourcePayload = new Uint8Array(source.subarray(source.length - 32));

assert.equal(decoder.decode(result.bytes.subarray(0, 8)), 'AWTDB001');
assert.equal(result.manifest.format, 'AWTAI-DB');
assert.equal(result.manifest.version, 0);
assert.equal(result.manifest.name, 'browser-synthetic');
assert.equal(result.manifest.diskFirst, true);
assert.equal(result.manifest.tensors.length, 1);
assert.equal(result.manifest.packets.length, 1);
assert.equal(result.manifest.tensors[0].name, 'token_embd.weight');
assert.equal(result.manifest.tensors[0].role, 'embed');
assert.equal(result.manifest.tensors[0].byteLength, 32);
assert.equal(result.manifest.storagePlan.tensorBytes, 32);
assert.equal(result.parsed.alignment, 32);
assert.equal(emittedManifest.dataRegion.offset, 16 + manifestLength);
assert.equal(emittedManifest.dataRegion.byteLength, 32);
assert.deepEqual(emittedPayload, sourcePayload);

console.log('B"H browser-converter.test passed');
