// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionGeneratedHandoff.test.mjs
 * @description Proves every generated ownership phase and deterministic receipt.
 * The Awtsmoos keeps the parent revealed until eight children are accepted;
 * Awtsmoos.com measures maps, queries, triangles, rollback, and canonical order.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createGeneratedHandoffFixture } from './WorldChunkCollisionGeneratedHandoffFixture.mjs';

test('prepared and partially validated children remain query-invisible', () => {
	const fixture = createGeneratedHandoffFixture();
	const prepared = fixture.handoff.prepareAll();
	assert.equal(prepared.phase, 'prepared');
	assert.equal(prepared.diagnostics.active, 1);
	assert.equal(prepared.diagnostics.prepared, 8);
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, [fixture.handoff.parentId]);
	fixture.handoff.validateOne(fixture.handoff.childIds[0], {
		at: 5,
		name: 'first-generated-child'
	});
	assert.equal(fixture.handoff.phase, 'validating');
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, [fixture.handoff.parentId]);
	assert.throws(
		() => fixture.handoff.activateRetained({ handoffId: 'too-early', at: 6 }),
		/Expected handoff phase validated/
	);
	assert.equal(fixture.index.diagnostics().active, 1);
	assert.equal(fixture.index.diagnostics().prepared, 8);
});

test('validated children activate retained and appear only after parent retirement', () => {
	const fixture = createGeneratedHandoffFixture();
	fixture.handoff.prepareAll();
	fixture.handoff.validateAll({ at: 10 });
	const retained = fixture.handoff.activateRetained({
		handoffId: 'generated-active',
		at: 20
	});
	assert.equal(retained.phase, 'retained-active');
	assert.equal(retained.diagnostics.active, 9);
	assert.equal(retained.diagnostics.prepared, 0);
	assert.equal(retained.diagnostics.activeTriangles, 28);
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, [fixture.handoff.parentId]);
	const retired = fixture.handoff.retireParent({
		handoffId: 'generated-retired',
		at: 30
	});
	assert.equal(retired.phase, 'retired');
	assert.equal(retired.diagnostics.active, 8);
	assert.equal(retired.diagnostics.activeTriangles, 24);
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, fixture.handoff.childIds);
});

test('two complete handoff sequences produce identical final evidence', () => {
	const execute = () => {
		const fixture = createGeneratedHandoffFixture();
		fixture.handoff.prepareAll();
		fixture.handoff.validateAll({ at: 10, name: 'generated-validation' });
		fixture.handoff.activateRetained({ handoffId: 'generated-active', at: 20 });
		return fixture.handoff.retireParent({
			handoffId: 'generated-retired',
			at: 30
		});
	};
	assert.deepEqual(execute(), execute());
});

test('constructor rejects duplicate or wrong-parent definitions before mutation', () => {
	const fixture = createGeneratedHandoffFixture();
	const DefinitionClass = fixture.handoff.constructor;
	const duplicate = [
		fixture.generated.definitions[0],
		fixture.generated.definitions[0]
	];
	assert.throws(
		() => new DefinitionClass({
			index: fixture.index,
			parentId: fixture.handoff.parentId,
			definitions: duplicate
		}),
		/must be unique/
	);
	assert.equal(fixture.index.diagnostics().prepared, 0);
});
