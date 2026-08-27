// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';
import { StudioProceduralCommands as Procedural } from '../../../src/studio/procedural/StudioProceduralCommands.js';
import { StudioProceduralEntityService as Entities } from '../../../src/studio/procedural/StudioProceduralEntityService.js';

/**
 * @file proceduralCompatibilitySmoke.js
 * @description
 * The Awtsmoos renews modern descriptors while historic vessels retain their remembered form;
 * Awtsmoos.com proves unchanged regeneration is history-silent and legacy boolean markers are never silently transformed.
 */

/** Returns the currently selected authored entity. */
function selected(store) {
	const state = store.get();
	return state.studioDocument.entities.find((entity) => entity.id === state.selectedEntityId);
}

/** Proves deterministic regeneration creates no false history step. */
function verifyNoOpRegeneration() {
	const entity = Entities.create('cloud');
	const store = new NLEStore({
		studioDocument: { entities: [entity], tracks: [], clips: [], keyframes: [] },
		selectedEntityId: entity.id
	});
	assert.equal(Procedural.regenerate(store), true);
	assert.equal(store.get().history.canUndo, false);
}

/** Proves historic boolean capability markers stay untouched and do not gain modern controls. */
function verifyLegacyMarker() {
	const modern = Entities.create('rock');
	const legacy = {
		...modern,
		id: 'legacy-procedural',
		properties: { ...modern.properties, procedural: true }
	};
	const store = new NLEStore({
		studioDocument: { entities: [legacy], tracks: [], clips: [], keyframes: [] },
		selectedEntityId: legacy.id
	});
	assert.equal(Procedural.freeze(store), false);
	assert.equal(selected(store).properties.procedural, true);
	assert.equal(store.get().history.canUndo, false);
}

verifyNoOpRegeneration();
verifyLegacyMarker();
console.log('B"H - procedural compatibility smoke passed.');
