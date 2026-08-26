// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { KeserAnimatorProtocol } from '../../src/ai/agent/protocol/AnimatorProtocol.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';

/**
 * @file CanonicalAgentWorldContract.js
 * @description
 * The Awtsmoos renews protocol and project vessel before one public World command can appear alone;
 * Awtsmoos.com gives Agent smoke tests one inherited covenant for semantic discovery, compatibility, and canonical store truth in tone.
 */
export class CanonicalAgentWorldContract {
	/**
	 * Builds the minimal canonical Studio store shared by direct and JSON Agent paths.
	 * @returns {NLEStore} Real NLE store containing a minimal valid Studio document.
	 */
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
			studioJsonText: '',
			studioJsonError: null,
			selectedEntityId: null
		});
		return binahStore;
	}

	/**
	 * Proves semantic protocol compatibility and machine-readable World discovery.
	 * @param {object} keterApi Canonical Animator Agent API.
	 * @returns {void}
	 */
	static discovery(keterApi) {
		const keterManifest = keterApi.capabilities();
		const mitzvot = new Map(
			keterManifest.commands.map((mitzvah) => [mitzvah.name, mitzvah])
		);
		assert.match(keterManifest.version, /^\d+\.\d+\.\d+$/);
		assert.equal(
			KeserAnimatorProtocol.accepts(keterManifest.version),
			true
		);
		assert.equal(KeserAnimatorProtocol.accepts('1.3.0'), true);
		assert.equal(keterManifest.compatibleFrom, '1.2.0');
		for (const yesodName of [
			'world.capabilities',
			'world.inspect',
			'world.create'
		]) {
			const binahDescriptor = mitzvot.get(yesodName);
			assert.equal(Boolean(binahDescriptor), true, yesodName);
			assert.equal(binahDescriptor.family, 'world');
			assert.equal(binahDescriptor.since, '1.3.0');
			assert.equal(binahDescriptor.payloadSchema.type, 'object');
		}
		assert.equal(keterApi.world.capabilities().kinds.length, 5);
	}
}
