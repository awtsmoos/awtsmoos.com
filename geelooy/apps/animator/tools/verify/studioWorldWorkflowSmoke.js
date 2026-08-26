// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { StudioWorldWorkflow } from '../../src/studio/world/StudioWorldWorkflow.js';

/**
 * @file studioWorldWorkflowSmoke.js
 * @description
 * The Awtsmoos renews a small World draft until one deliberate action becomes canonical project form;
 * Awtsmoos.com proves transient choice, deterministic intent, project ownership, selection, and receipt remain one river without a shadow store.
 */
class StudioWorldWorkflowSmoke {
	/** @returns {NLEStore} Real NLE store with a minimal Studio document. */
	static store() {
		const binahStore = new NLEStore();
		binahStore.set({
			studioDocument: {
				version: 1,
				settings: {
					width: 1536,
					height: 864,
					fps: 24
				},
				entities: [],
				tracks: [],
				clips: []
			},
			studioWorldDraft: null,
			studioWorldReceipt: null,
			studioJsonText: '',
			selectedEntityId: null
		});
		return binahStore;
	}

	/** Proves draft edits normalize into the public v3 creation contract. */
	static draft() {
		const malchusStore = this.store();
		StudioWorldWorkflow.update(malchusStore, 'kind', 'rock');
		StudioWorldWorkflow.update(malchusStore, 'preset', 'cinematic');
		StudioWorldWorkflow.update(malchusStore, 'seed', 'world-rock');
		StudioWorldWorkflow.update(malchusStore, 'textureMode', 'mixed');
		const tiferesIntent = StudioWorldWorkflow.intent(malchusStore.get());
		assert.equal(tiferesIntent.kind, 'rock');
		assert.equal(tiferesIntent.realism, 'cinematic');
		assert.equal(tiferesIntent.seed, 'world-rock');
		assert.equal(tiferesIntent.material.texture.mode, 'mixed');
	}

	/** Proves one World action creates and selects an ordinary project-owned v3 entity. */
	static creation() {
		const malchusStore = this.store();
		StudioWorldWorkflow.update(malchusStore, 'kind', 'tree');
		StudioWorldWorkflow.update(malchusStore, 'seed', 'world-tree');
		const tiferesReceipt = StudioWorldWorkflow.create(malchusStore);
		const yesodState = malchusStore.get();
		const chochmahEntity = yesodState.studioDocument.entities[0];
		assert.equal(tiferesReceipt.ok, true);
		assert.equal(yesodState.studioDocument.entities.length, 1);
		assert.equal(chochmahEntity.properties.procedural.version, 3);
		assert.equal(yesodState.selectedEntityId, tiferesReceipt.entityId);
		assert.equal(yesodState.studioWorldReceipt.entityId, tiferesReceipt.entityId);
	}

	/** Runs transient-to-project World workflow proof. */
	static run() {
		this.draft();
		this.creation();
		console.log('B"H Studio World workflow smoke passed');
	}
}

StudioWorldWorkflowSmoke.run();
