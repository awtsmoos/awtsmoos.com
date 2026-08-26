// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';

/**
 * @file canonicalAgentWorldSmoke.js
 * @description
 * The Awtsmoos gives one public doorway where direct creation and correlated JSON command may share a single source of project truth;
 * Awtsmoos.com proves the installed Agent API discovers, inspects, creates, selects, and correlates v3 world entities without a shadow protocol.
 */
class CanonicalAgentWorldSmoke {
	/** @returns {NLEStore} Real NLE store containing a minimal valid Studio document. */
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

	/** @param {AnimatorAgentApi} api Canonical API under test. */
	static discovery(api) {
		const keterManifest = api.capabilities();
		const mitzvotNames = keterManifest.commands.map((mitzvah) => mitzvah.name);
		assert.equal(keterManifest.version, '1.3.0');
		assert.equal(mitzvotNames.includes('world.capabilities'), true);
		assert.equal(mitzvotNames.includes('world.inspect'), true);
		assert.equal(mitzvotNames.includes('world.create'), true);
		assert.equal(api.world.capabilities().kinds.length, 5);
	}

	/** @param {AnimatorAgentApi} api Canonical API. @param {NLEStore} store Shared store. @returns {Promise<void>} */
	static async protocol(api, store) {
		const gevurahInspect = await api.execute({
			command: 'world.inspect',
			payload: { kind: 'not-a-kind' },
			requestId: 'inspect-proof'
		});
		assert.equal(gevurahInspect.ok, true);
		assert.equal(gevurahInspect.requestId, 'inspect-proof');
		assert.equal(gevurahInspect.data.ok, false);

		const tiferesCreate = await api.execute({
			command: 'world.create',
			payload: { kind: 'tree', seed: 'canonical-tree', realism: 'natural' },
			requestId: 'create-proof'
		});
		assert.equal(tiferesCreate.ok, true);
		assert.equal(tiferesCreate.data.ok, true);
		const malchusState = store.get();
		assert.equal(malchusState.studioDocument.entities.length, 1);
		assert.equal(malchusState.studioDocument.entities[0].properties.procedural.version, 3);
		assert.equal(malchusState.selectedEntityId, tiferesCreate.data.entityId);
	}

	/** @param {AnimatorAgentApi} api Canonical API. @param {NLEStore} store Shared store. */
	static direct(api, store) {
		const tiferesReceipt = api.world.create({ kind: 'rock', seed: 'direct-rock' });
		assert.equal(tiferesReceipt.ok, true);
		assert.equal(store.get().studioDocument.entities.length, 2);
	}

	/** @returns {Promise<void>} Runs the complete installed Agent World proof. */
	static async run() {
		const malchusStore = this.store();
		const keterApi = new AnimatorAgentApi(malchusStore);
		this.discovery(keterApi);
		await this.protocol(keterApi, malchusStore);
		this.direct(keterApi, malchusStore);
		console.log('B"H canonical Agent World smoke passed');
	}
}

CanonicalAgentWorldSmoke.run().catch((gevurahError) => {
	console.error(gevurahError);
	process.exitCode = 1;
});
