// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorHistoryActions.test.js
 * @description Proves the session undo/redo path reverses and replays composed
 * universe placements exactly: every sub-part leaves and returns together,
 * inventory is refunded and re-charged once, and failed reversals return the
 * receipt to its ledger custody.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { HistoryLedger } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import {
	redoCreatorAction,
	undoCreatorAction
} from './MitzvahWorldCreatorHistoryActions.js';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';
import { commitUniversePlacement } from './MitzvahWorldCreatorTransactions.js';
import { resolveUniverseShape } from './MitzvahWorldUniverseShapeResolver.js';

function fakeInventory(start = {}) {
	const items = new Map(Object.entries(start));
	return {
		add: (id, n) => items.set(id, (items.get(id) ?? 0) + n),
		quantity: id => items.get(id) ?? 0,
		remove: (id, n) => {
			const have = items.get(id) ?? 0;
			if (have < n) throw new Error(`INVENTORY_SHORT:${id}`);
			items.set(id, have - n);
		}
	};
}

function fakeRuntimeAdapter() {
	const runtime = {
		mainOctree: { insert: () => true, remove: () => {} },
		scene: {
			add: mesh => {
				mesh.parent = { remove: () => {} };
			}
		}
	};
	return new MitzvahWorldCreatorRuntimeAdapter(runtime, {
		createColliders: definition => [{ colliderFor: definition.id }],
		createMesh: definition => ({ id: definition.id, parent: null })
	});
}

function makeSession() {
	return {
		catalogPart: id => mitzvahWorldCreatorPart(id),
		documentStore: new MitzvahWorldCreatorDocument({ environment: {} }),
		history: new HistoryLedger(),
		inventory: fakeInventory({ 'timber-house-kit': 10, 'oak-sapling': 10 }),
		runtimeAdapter: fakeRuntimeAdapter()
	};
}

function semanticObjects(session) {
	return structuredClone(session.documentStore.document.resources.objects || {});
}

async function placeHouse(session, groupId = 'creator-timber-house-0001') {
	const part = mitzvahWorldCreatorPart('timber-house');
	const definitions = resolveUniverseShape('timber-house', {
		id: groupId,
		position: { x: 6, y: part.size.y / 2, z: 1 },
		rotation: { y: 0 }
	});
	const receipt = await commitUniversePlacement(session, part, definitions);
	return { definitions, part, receipt };
}

test('undo removes every universe piece and refunds the single cost', async () => {
	const session = makeSession();
	const { definitions, part, receipt } = await placeHouse(session);
	const emptyObjects = {};
	assert.equal(Object.keys(semanticObjects(session)).length, definitions.length);

	const undone = await undoCreatorAction(session);
	assert.equal(undone, receipt);
	assert.deepEqual(semanticObjects(session), emptyObjects, 'document must return to the exact prior state');
	assert.equal(session.runtimeAdapter.diagnostics().mounted, 0, 'every piece must unmount');
	assert.equal(session.inventory.quantity('timber-house-kit'), 10, 'the single catalog cost must be refunded');
	assert.equal(session.history.snapshot().undoCount, 0);
	assert.equal(session.history.snapshot().redoCount, 1);
});

test('redo replays every universe piece and re-charges the single cost', async () => {
	const session = makeSession();
	const { definitions, part } = await placeHouse(session);
	const committedObjects = semanticObjects(session);

	await undoCreatorAction(session);
	const redone = await redoCreatorAction(session);

	assert.deepEqual(semanticObjects(session), committedObjects, 'redo must restore the exact committed document');
	assert.equal(session.runtimeAdapter.diagnostics().mounted, definitions.length, 'every piece must remount');
	assert.equal(session.inventory.quantity('timber-house-kit'), 10 - part.cost);
	assert.equal(session.history.snapshot().undoCount, 1);
	assert.equal(session.history.snapshot().redoCount, 0);
});

test('undo/redo of an update receipt replays the definition change', async () => {
	const session = makeSession();
	const { definitions } = await placeHouse(session);
	const target = definitions[0];
	const before = structuredClone(target);
	const after = structuredClone({ ...target, position: { x: 42, y: target.position.y, z: target.position.z } });

	await session.documentStore.updatePart(target.id, after);
	session.history.commit({ after, before, catalogId: 'timber-house', operation: 'update' });

	await undoCreatorAction(session);
	assert.equal(session.documentStore.readPart(target.id).definition.position.x, before.position.x);

	await redoCreatorAction(session);
	assert.equal(session.documentStore.readPart(target.id).definition.position.x, 42);
});

test('failed undo returns the receipt to undo custody', async () => {
	const session = makeSession();
	await placeHouse(session);

	const realDelete = session.documentStore.deletePart.bind(session.documentStore);
	session.documentStore.deletePart = async () => {
		throw new Error('DELETE_BOOM');
	};
	await assert.rejects(() => undoCreatorAction(session), /DELETE_BOOM/);
	session.documentStore.deletePart = realDelete;

	assert.equal(session.history.snapshot().undoCount, 1);
	assert.equal(session.history.snapshot().redoCount, 0);
});

test('undo/redo return null when the ledger is empty', async () => {
	const session = makeSession();
	assert.equal(await undoCreatorAction(session), null);
	assert.equal(await redoCreatorAction(session), null);
});
