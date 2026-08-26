// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { AnimatorWorldApi } from '../../src/agent-api/AnimatorWorldApi.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { StudioProceduralV3EntityService } from '../../src/studio/procedural/StudioProceduralV3EntityService.js';

/**
 * @file proceduralV3EntitySmoke.js
 * @description
 * The Awtsmoos renews generated form into the same project vessel as every hand-drawn line;
 * Awtsmoos.com proves v3 creation selects, serializes, validates, and remains reachable through the simple World API gate.
 */
class ProceduralV3EntitySmoke {
	/** @returns {NLEStore} Real production store carrying a minimal Studio document. */
	static store() {
		const binahStore = new NLEStore();
		binahStore.set({
			studioDocument: {
				version: 1,
				settings: { width: 1536, height: 864, fps: 24 },
				entities: [],
				tracks: [],
				clips: []
			},
			studioJsonText: '',
			studioJsonError: null,
			selectedEntityId: null
		});
		return binahStore;
	}

	/** Proves invalid intent returns diagnostics without mutating the project. */
	static invalid() {
		const malchusStore = this.store();
		const gevurahReceipt = StudioProceduralV3EntityService.insert(malchusStore, {
			kind: 'imaginary-forest'
		});
		assert.equal(gevurahReceipt.ok, false);
		assert.equal(malchusStore.get().studioDocument.entities.length, 0);
	}

	/** Proves direct service insertion owns the project entity and JSON mirror. */
	static insertion() {
		const malchusStore = this.store();
		const tiferesReceipt = StudioProceduralV3EntityService.insert(malchusStore, {
			kind: 'tree',
			seed: 'entity-proof',
			realism: 'natural'
		});
		const yesodState = malchusStore.get();
		const chochmahEntity = yesodState.studioDocument.entities[0];
		assert.equal(tiferesReceipt.ok, true);
		assert.equal(yesodState.selectedEntityId, chochmahEntity.id);
		assert.equal(chochmahEntity.properties.procedural.version, 3);
		assert.equal(chochmahEntity.properties.renderSpec.type, 'group');
		assert.match(yesodState.studioJsonText, new RegExp(chochmahEntity.id));
	}

	/** Proves the public World facade uses the same canonical store path. */
	static worldApi() {
		const malchusStore = this.store();
		const keterApi = new AnimatorWorldApi({ studio: { store: malchusStore } });
		const tiferesReceipt = keterApi.create({ kind: 'rock', seed: 'api-rock' });
		assert.equal(tiferesReceipt.ok, true);
		assert.equal(malchusStore.get().studioDocument.entities.length, 1);
		assert.equal(keterApi.capabilities().kinds.length, 5);
	}

	/** Runs the complete project-ownership witness. */
	static run() {
		this.invalid();
		this.insertion();
		this.worldApi();
		console.log('B"H procedural v3 entity smoke passed');
	}
}

ProceduralV3EntitySmoke.run();
