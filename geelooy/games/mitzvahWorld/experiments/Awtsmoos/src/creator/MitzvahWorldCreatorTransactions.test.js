// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorTransactions.test.js
 * @description Proves universe placement commits every composed primitive
 * atomically with compensation on partial failure, and that undo/redo restore
 * the exact prior state for both composed universes and single primitives.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { HistoryLedger } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';
import { resolveUniverseShape } from './MitzvahWorldUniverseShapeResolver.js';
import {
	commitCreatorPlacement,
	commitUniversePlacement,
	redoCreatorPlacement,
	undoCreatorPlacement
} from './MitzvahWorldCreatorTransactions.js';

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

function fakeRuntimeAdapter(failOnIds = new Set()) {
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
		createMesh: definition => {
			if (failOnIds.has(definition.id)) throw new Error(`MOUNT_BOOM:${definition.id}`);
			return { id: definition.id, parent: null };
		}
	});
}

function makeSession(overrides = {}) {
	return {
		catalogPart: id => mitzvahWorldCreatorPart(id),
		documentStore: new MitzvahWorldCreatorDocument({ environment: {} }),
		history: new HistoryLedger(),
		inventory: fakeInventory({ 'oak-sapling': 10, 'timber-house-kit': 10, 'wood-log': 10 }),
		runtimeAdapter: fakeRuntimeAdapter(),
		...overrides
	};
}

function universeDefinitions(partId, groupId) {
	const part = mitzvahWorldCreatorPart(partId);
	return {
		definitions: resolveUniverseShape(partId, {
			id: groupId,
			position: { x: 4, y: part.size.y / 2, z: -3 },
			rotation: { y: 0 }
		}),
		part
	};
}

function documentObjectCount(session) {
	return Object.keys(session.documentStore.document.resources.objects || {}).length;
}

/** Semantic document content, ignoring the audit revision counter. */
function semanticObjects(session) {
	return structuredClone(session.documentStore.document.resources.objects || {});
}

test('commitUniversePlacement commits every composed piece as one deed', async () => {
	const session = makeSession();
	const { definitions, part } = universeDefinitions('oak-tree', 'creator-oak-tree-0001');
	const before = session.documentStore.serialize();

	const receipt = await commitUniversePlacement(session, part, definitions);

	assert.equal(receipt.universe, true);
	assert.equal(receipt.definitions.length, definitions.length);
	assert.ok(definitions.length > 1, 'oak tree must compose multiple primitives');
	assert.equal(documentObjectCount(session), definitions.length);
	assert.equal(session.runtimeAdapter.diagnostics().mounted, definitions.length);
	assert.equal(session.inventory.quantity('oak-sapling'), 10 - part.cost);
	assert.equal(session.history.snapshot().undoCount, 1);
	assert.notEqual(session.documentStore.serialize(), before);
});

test('commitUniversePlacement compensates a mid-commit mount failure', async () => {
	const { definitions, part } = universeDefinitions('timber-house', 'creator-timber-house-0001');
	const failingId = definitions[1].id;
	const session = makeSession({ runtimeAdapter: fakeRuntimeAdapter(new Set([failingId])) });
	const inventoryBefore = session.inventory.quantity('timber-house-kit');
	const objectsBefore = semanticObjects(session);

	await assert.rejects(
		() => commitUniversePlacement(session, part, definitions),
		/MOUNT_BOOM/
	);

	assert.equal(documentObjectCount(session), 0, 'no ghost document parts may remain');
	assert.equal(session.runtimeAdapter.diagnostics().mounted, 0, 'no ghost runtime mounts may remain');
	assert.equal(session.inventory.quantity('timber-house-kit'), inventoryBefore, 'material must be untouched');
	assert.deepEqual(semanticObjects(session), objectsBefore, 'document must be semantically unchanged');
	assert.equal(session.history.snapshot().undoCount, 0, 'failed deeds leave no history');
});

test('commitUniversePlacement refuses empty definitions and short material', async () => {
	const session = makeSession();
	const part = mitzvahWorldCreatorPart('oak-tree');
	await assert.rejects(() => commitUniversePlacement(session, part, []), /UNIVERSE_PLACEMENT_EMPTY/);
	await assert.rejects(() => commitUniversePlacement(session, part, null), /UNIVERSE_PLACEMENT_EMPTY/);

	const poorSession = makeSession({ inventory: fakeInventory({ 'oak-sapling': 0 }) });
	const { definitions } = universeDefinitions('oak-tree', 'creator-oak-tree-0002');
	await assert.rejects(
		() => commitUniversePlacement(poorSession, part, definitions),
		/CREATOR_MATERIAL_REQUIRED:oak-sapling/
	);
	assert.equal(documentObjectCount(poorSession), 0);
});

test('undo/redo restores a universe placement exactly', async () => {
	const session = makeSession();
	const { definitions, part } = universeDefinitions('timber-house', 'creator-timber-house-0003');
	const emptyObjects = semanticObjects(session);

	const receipt = await commitUniversePlacement(session, part, definitions);
	const committedObjects = semanticObjects(session);
	const committedMounts = session.runtimeAdapter.diagnostics().ids;

	const undone = await undoCreatorPlacement(session);
	assert.equal(undone, receipt);
	assert.equal(documentObjectCount(session), 0, 'undo must remove every composed piece');
	assert.equal(session.runtimeAdapter.diagnostics().mounted, 0, 'undo must unmount every piece');
	assert.equal(session.inventory.quantity('timber-house-kit'), 10, 'undo must refund the exact cost');
	assert.deepEqual(semanticObjects(session), emptyObjects, 'document must return to the exact prior state');
	assert.equal(session.history.snapshot().undoCount, 0);
	assert.equal(session.history.snapshot().redoCount, 1);

	const redone = await redoCreatorPlacement(session);
	assert.equal(redone, receipt);
	assert.deepEqual(semanticObjects(session), committedObjects, 'redo must restore the exact committed document');
	assert.deepEqual(
		[...session.runtimeAdapter.diagnostics().ids].sort(),
		[...committedMounts].sort(),
		'redo must remount every piece'
	);
	assert.equal(session.inventory.quantity('timber-house-kit'), 10 - part.cost);
	assert.equal(session.history.snapshot().undoCount, 1);
	assert.equal(session.history.snapshot().redoCount, 0);
});

test('undo/redo still handles single-primitive receipts', async () => {
	const session = makeSession();
	const part = mitzvahWorldCreatorPart('timber-wall');
	const definition = {
		color: part.color,
		id: 'creator-timber-wall-0001',
		position: { x: 1, y: 1, z: 1 },
		rotation: { y: 0 },
		shape: 'box',
		size: { ...part.size }
	};
	const emptyObjects = semanticObjects(session);

	await commitCreatorPlacement(session, part, definition);
	const committedObjects = semanticObjects(session);
	assert.equal(documentObjectCount(session), 1);

	await undoCreatorPlacement(session);
	assert.equal(documentObjectCount(session), 0);
	assert.equal(session.runtimeAdapter.diagnostics().mounted, 0);
	assert.equal(session.inventory.quantity('wood-log'), 10);
	assert.deepEqual(semanticObjects(session), emptyObjects);

	await redoCreatorPlacement(session);
	assert.equal(documentObjectCount(session), 1);
	assert.equal(session.runtimeAdapter.diagnostics().mounted, 1);
	assert.deepEqual(semanticObjects(session), committedObjects);
});

test('failed undo keeps history custody and restores committed state', async () => {
	const session = makeSession();
	const { definitions, part } = universeDefinitions('oak-tree', 'creator-oak-tree-0004');
	await commitUniversePlacement(session, part, definitions);
	const committedObjects = semanticObjects(session);

	// Sabotage one document deletion so undo fails midway.
	const realDelete = session.documentStore.deletePart.bind(session.documentStore);
	session.documentStore.deletePart = async id => {
		if (id === definitions[0].id) throw new Error('DELETE_BOOM');
		return realDelete(id);
	};

	await assert.rejects(() => undoCreatorPlacement(session), /DELETE_BOOM/);
	assert.equal(session.history.snapshot().undoCount, 1, 'failed undo must return the receipt to undo custody');
	assert.equal(session.history.snapshot().redoCount, 0);

	// Best-effort restore: every piece must be back in document and runtime.
	// (The audit revision counter legitimately advances with each mutation.)
	session.documentStore.deletePart = realDelete;
	assert.deepEqual(semanticObjects(session), committedObjects);
	assert.equal(session.runtimeAdapter.diagnostics().mounted, definitions.length);
});

test('undo/redo return null when history is empty', async () => {
	const session = makeSession();
	assert.equal(await undoCreatorPlacement(session), null);
	assert.equal(await redoCreatorPlacement(session), null);
});
