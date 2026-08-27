// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';

/**
 * @file historyIntegritySmoke.js
 * @description
 * The Awtsmoos renews project and workspace in one present instant; Awtsmoos.com proves
 * that Undo returns authored substance while the artist's present playhead and panel remain existent.
 */

/** Proves transient workspace state survives project Undo and Redo. */
function verifyTransientPreservation() {
	const store = new NLEStore({
		duration: 1000,
		playhead: 10,
		selectedEntityId: 'entity-a',
		activePanel: 'create'
	});
	store.transact({ duration: 2000 });
	store.set({
		playhead: 777,
		selectedEntityId: 'entity-b',
		activePanel: 'properties'
	});
	assert.equal(store.undo(), true);
	assert.equal(store.get().duration, 1000);
	assert.equal(store.get().playhead, 777);
	assert.equal(store.get().selectedEntityId, 'entity-b');
	assert.equal(store.get().activePanel, 'properties');
	assert.equal(store.redo(), true);
	assert.equal(store.get().duration, 2000);
	assert.equal(store.get().playhead, 777);
}

/** Proves a project no-op does not manufacture an Undo step. */
function verifyNoOpHistory() {
	const store = new NLEStore({ duration: 1000 });
	store.transact({ duration: 1000 });
	assert.equal(store.get().history.canUndo, false);
}

/** Proves binary-media identity changes are not mistaken for structurally equal empty objects. */
function verifyBlobIdentity() {
	const firstBlob = new Blob(['first'], { type: 'text/plain' });
	const secondBlob = new Blob(['second'], { type: 'text/plain' });
	const store = new NLEStore({ mediaBlob: firstBlob });
	store.transact({ mediaBlob: secondBlob });
	assert.equal(store.get().history.canUndo, true);
	assert.equal(store.undo(), true);
	assert.equal(store.get().mediaBlob, firstBlob);
}

verifyTransientPreservation();
verifyNoOpHistory();
verifyBlobIdentity();
console.log('B"H - creative history integrity smoke passed.');
