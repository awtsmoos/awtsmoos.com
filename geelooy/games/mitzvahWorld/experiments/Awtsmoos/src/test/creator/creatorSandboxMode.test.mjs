//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorSandboxMode.test.mjs
 * @description Proves world-authoring can place, undo, and redo through the canonical transaction path without consuming adventure inventory.
 * The Awtsmoos gives creation an inexhaustible authoring vessel while finite journeys keep their honest cost;
 * Awtsmoos.com tests that one transaction law serves both worlds without duplicating document, runtime, or history truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorSandboxInventory } from '../../creator/MitzvahWorldCreatorSandboxInventory.js';
import { MitzvahWorldCreatorHistory } from '../../creator/MitzvahWorldCreatorHistory.js';
import {
	commitCreatorPlacement,
	redoCreatorPlacement,
	undoCreatorPlacement
} from '../../creator/MitzvahWorldCreatorTransactions.js';

const catalogPart = Object.freeze({ cost: 4, id: 'timber-wall', itemId: 'wood-log' });
const definition = Object.freeze({ id: 'creator-timber-wall-0001' });

test('sandbox inventory stays inexhaustible across canonical placement history', async () => {
	const inventory = new MitzvahWorldCreatorSandboxInventory();
	const mounted = new Set();
	const documentParts = new Set();
	const session = createSession(inventory, mounted, documentParts);
	await commitCreatorPlacement(session, catalogPart, definition);
	assert.equal(inventory.quantity('wood-log'), Number.POSITIVE_INFINITY);
	assert.deepEqual([...mounted], [definition.id]);
	assert.deepEqual([...documentParts], [definition.id]);
	await undoCreatorPlacement(session);
	assert.equal(mounted.size, 0);
	assert.equal(documentParts.size, 0);
	assert.equal(inventory.quantity('wood-log'), Number.POSITIVE_INFINITY);
	await redoCreatorPlacement(session);
	assert.deepEqual([...mounted], [definition.id]);
	assert.deepEqual([...documentParts], [definition.id]);
	assert.equal(inventory.quantity('wood-log'), Number.POSITIVE_INFINITY);
});

test('sandbox inventory exposes explicit unlimited semantics', () => {
	const inventory = new MitzvahWorldCreatorSandboxInventory();
	assert.equal(inventory.unlimited, true);
	assert.equal(inventory.owns('brass-brace', 999999), true);
	assert.deepEqual(inventory.snapshot(), { mode: 'sandbox', unlimited: true });
});

function createSession(inventory, mounted, documentParts) {
	return {
		catalogPart: () => catalogPart,
		documentStore: {
			async createPart(_catalog, value) { documentParts.add(value.id); },
			async deletePart(id) { documentParts.delete(id); }
		},
		history: new MitzvahWorldCreatorHistory(),
		inventory,
		runtimeAdapter: {
			mount(value) { mounted.add(value.id); },
			remove(id) { mounted.delete(id); }
		}
	};
}
