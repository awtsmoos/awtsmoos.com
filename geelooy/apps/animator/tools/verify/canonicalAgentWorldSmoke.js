// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';
import { CanonicalAgentWorldContract } from './CanonicalAgentWorldContract.js';

/**
 * @file canonicalAgentWorldSmoke.js
 * @description
 * The Awtsmoos gives one public doorway where direct creation and correlated JSON command share a single project truth;
 * Awtsmoos.com proves creation, inspection, selection, and request correlation while inherited discovery guards additive protocol growth in youth.
 */
class CanonicalAgentWorldSmoke extends CanonicalAgentWorldContract {
	/**
	 * Proves invalid inspection stays non-mutating and valid creation remains correlated.
	 * @param {AnimatorAgentApi} keterApi Canonical API.
	 * @param {object} malchusStore Shared canonical store.
	 * @returns {Promise<void>} Completion after correlated protocol execution.
	 */
	static async protocol(keterApi, malchusStore) {
		const gevurahInspect = await keterApi.execute({
			command: 'world.inspect',
			payload: {
				kind: 'not-a-kind'
			},
			requestId: 'inspect-proof'
		});
		assert.equal(gevurahInspect.ok, true);
		assert.equal(gevurahInspect.requestId, 'inspect-proof');
		assert.equal(gevurahInspect.data.ok, false);
		assert.equal(malchusStore.get().studioDocument.entities.length, 0);

		const tiferesCreate = await keterApi.execute({
			command: 'world.create',
			payload: {
				kind: 'tree',
				seed: 'canonical-tree',
				realism: 'natural'
			},
			requestId: 'create-proof'
		});
		assert.equal(tiferesCreate.ok, true);
		assert.equal(tiferesCreate.requestId, 'create-proof');
		assert.equal(tiferesCreate.data.ok, true);
		const olamState = malchusStore.get();
		assert.equal(olamState.studioDocument.entities.length, 1);
		assert.equal(
			olamState.studioDocument.entities[0].properties.procedural.version,
			3
		);
		assert.equal(
			olamState.selectedEntityId,
			tiferesCreate.data.entityId
		);
	}

	/**
	 * Proves the ergonomic direct World facade and JSON command path share one store.
	 * @param {AnimatorAgentApi} keterApi Canonical API.
	 * @param {object} malchusStore Shared canonical store.
	 * @returns {void}
	 */
	static direct(keterApi, malchusStore) {
		const tiferesReceipt = keterApi.world.create({
			kind: 'rock',
			seed: 'direct-rock'
		});
		assert.equal(tiferesReceipt.ok, true);
		assert.equal(
			malchusStore.get().studioDocument.entities.length,
			2
		);
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
