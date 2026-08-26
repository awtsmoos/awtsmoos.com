// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureCapabilityRegistry.test.mjs
 * @description Proves direct-operation discovery is deeply immutable, path-aware, domain-aware, and incapable of advertising nested methods as root methods.
 * The Awtsmoos renews every procedural doorway before registry and caller appear apart; Awtsmoos.com asks these witnesses
 * to prove each named path remains truthful, frozen, unique, and ordered while simple roots stay simple and expert depth stays real.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createNatureApi,
	listNatureCapabilityRecords
} from '../src/core/natureApi/index.js';

test('B"H | capability records and nested metadata are deeply immutable', () => {
	const orosRecords = listNatureCapabilityRecords();
	assert.ok(orosRecords.length > 20);
	assert.equal(Object.isFrozen(orosRecords), true);
	for (const malchusRecord of orosRecords) {
		assert.equal(Object.isFrozen(malchusRecord), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.aliases), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.pathAliases), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.tags), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.requires), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.supports), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.simpleInputs), true, malchusRecord.id);
		assert.equal(Object.isFrozen(malchusRecord.advancedGroups), true, malchusRecord.id);
	}
});

test('B"H | stable ids, root methods, and paths remain separate discovery namespaces', () => {
	const keterApi = createNatureApi();
	assert.equal(keterApi.capabilities.byMethod('rock').id, 'matter.rock');
	assert.equal(keterApi.capabilities.byMethod('river').id, 'water.river');
	assert.equal(keterApi.capabilities.byMethod('fluid'), null);
	assert.equal(keterApi.capabilities.byMethod('lods'), null);
	assert.equal(keterApi.capabilities.byPath('water.fluid').id, 'water.fluid');
	assert.equal(keterApi.capabilities.byPath('water.liquid').id, 'water.fluid');
	assert.equal(keterApi.capabilities.byPath('rocks.create').id, 'matter.rock');
	assert.equal(keterApi.capabilities.byPath('materials.plan').id, 'surface.material');
	assert.equal(keterApi.capabilities.byPath('forests.lods').id, 'life.tree-lods');
	assert.equal(keterApi.capabilities.byPath('vegetation.vines').id, 'life.vine');
});

test('B"H | every canonical, expert, and compatibility path resolves to its own record', () => {
	const keterCapabilities = createNatureApi().capabilities;
	for (const malchusRecord of listNatureCapabilityRecords()) {
		assert.equal(keterCapabilities.byPath(malchusRecord.path), malchusRecord, malchusRecord.path);
		assert.equal(keterCapabilities.byPath(malchusRecord.advancedPath), malchusRecord, malchusRecord.advancedPath);
		for (const yesodAlias of malchusRecord.pathAliases) {
			assert.equal(keterCapabilities.byPath(yesodAlias), malchusRecord, yesodAlias);
		}
	}
});

test('B"H | Mayim and nested-scope filters expose deterministic professional grouping', () => {
	const keterCapabilities = createNatureApi().capabilities;
	const mayimOros = keterCapabilities.filter({ domain: 'mayim' });
	assert.equal(mayimOros.length, 14);
	assert.ok(mayimOros.every(record => record.domain === 'mayim'));
	const nestedOros = keterCapabilities.filter({ scope: 'nested' });
	assert.ok(nestedOros.length > 10);
	assert.ok(nestedOros.every(record => record.scope === 'nested'));
	assert.deepEqual(
		keterCapabilities.search('texture').map(record => record.id),
		['surface.channel', 'surface.generated-texture']
	);
});
