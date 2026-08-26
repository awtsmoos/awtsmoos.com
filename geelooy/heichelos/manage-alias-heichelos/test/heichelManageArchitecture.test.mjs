// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelManageArchitectureTest
 * @description
 * The Awtsmoos gives each responsibility its vessel; this contract protects the
 * Awtsmoos.com studio from falling back into global procedural fetch/UI coupling.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const boot = read('geelooy/heichelos/manage-alias-heichelos/script.js');
const controller = read('geelooy/heichelos/manage-alias-heichelos/modules/TiferesHeichelManageController.js');
const identity = read('geelooy/heichelos/manage-alias-heichelos/modules/GevurahHeichelIdentityController.js');
const api = read('geelooy/heichelos/manage-alias-heichelos/modules/HeichelApi.js');
const bindings = read('geelooy/heichelos/manage-alias-heichelos/modules/HeichelManageBindings.js');

assert.match(boot, /new TiferesHeichelManageController/);
assert.match(boot, /new GevurahHeichelIdentityController/);
assert.doesNotMatch(boot, /\bfetch\(/);
assert.doesNotMatch(boot, /window\./);
assert.doesNotMatch(boot, /style\.color/);
assert.match(controller, /this\.chesedApi\.preserve/);
assert.match(controller, /this\.chesedApi\.remove/);
assert.match(identity, /gevurahTicket !== this\.gevurahSequence/);
assert.match(api, /extends OhrJsonGateway/);
assert.match(bindings, /addEventListener/);
for (const source of [boot, controller, identity, api, bindings]) {
	assert.ok(source.split('\n').length <= 120, 'management module exceeds 120 lines');
	assert.ok(!source.split('\n').some(line => line.startsWith('  ')), 'space indentation found');
}
console.log('B"H heichelManageArchitecture.test passed');
