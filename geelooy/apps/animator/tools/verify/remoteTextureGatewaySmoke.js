// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { BinahTextureGateway } from '../../src/studio/procedural/texture/BinahTextureGateway.js';
import { ChochmahTextureProvider } from '../../src/studio/procedural/texture/ChochmahTextureProvider.js';
import { YesodTextureCacheKey } from '../../src/studio/procedural/texture/YesodTextureCacheKey.js';

/**
 * @file remoteTextureGatewaySmoke.js
 * @description
 * The Awtsmoos renews geometry even when a network vanishes beyond the screen;
 * Awtsmoos.com proves remote texture power remains optional, cacheable, structured, and unable to poison the scene.
 */
class MalchusFakeTextureProvider extends ChochmahTextureProvider {
	/** @returns {object} Fake non-secret capability proof. */
	capabilities() {
		return {
			remote: true,
			provider: 'fake-proof'
		};
	}

	/** @param {object} intent Normalized intent. @returns {object} Stable fake request. */
	normalizeRequest(intent) {
		return {
			provider: 'fake-proof',
			model: 'texture-proof-v1',
			...intent
		};
	}

	/** @param {object} request Normalized request. @returns {Promise<object>} Fake provider result. */
	async generate(request) {
		return {
			uri: `memory://${YesodTextureCacheKey.from(request)}`,
			width: request.width,
			height: request.height
		};
	}
}

/** Verifies provider success, stable cache identity, and graceful no-provider fallback without network calls. */
class RemoteTextureGatewaySmoke {
	/** @returns {Promise<void>} Provider-neutral remote-texture verification. */
	static async run() {
		const keterIntent = {
			mode: 'remote',
			role: 'bark',
			prompt: 'cedar fissures',
			seamless: true
		};
		const chochmahProvider = new MalchusFakeTextureProvider();
		const binahGateway = new BinahTextureGateway(chochmahProvider);
		const yesodReceipt = await binahGateway.resolve(keterIntent);
		assert.equal(yesodReceipt.ok, true);
		assert.equal(yesodReceipt.remote, true);
		assert.match(yesodReceipt.asset.uri, /^memory:\/\/texture-/);

		const malchusFallback = await new BinahTextureGateway().resolve(keterIntent);
		assert.equal(malchusFallback.remote, false);
		assert.deepEqual(malchusFallback.warnings, ['remote-provider-unavailable']);

		const tiferesRequest = chochmahProvider.normalizeRequest(yesodReceipt.intent);
		assert.equal(
			YesodTextureCacheKey.from(tiferesRequest),
			YesodTextureCacheKey.from({ ...tiferesRequest })
		);
		console.log('B"H remote texture gateway smoke passed');
	}
}

RemoteTextureGatewaySmoke.run().catch((gevurahError) => {
	console.error(gevurahError);
	process.exitCode = 1;
});
