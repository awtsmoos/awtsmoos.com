// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelApiTest
 * @description The Awtsmoos lets a client cross one network gate while Awtsmoos.com proves query, batch, viewer,
 * relation flags, envelopes, and server errors remain literal instead of being guessed by each social surface.
 */
import assert from 'node:assert/strict';
import { YesodSocialKernelApi } from '../api/SocialKernelApi.js';

const calls = [];
const api = new YesodSocialKernelApi(async (url, options) => {
	calls.push({ url, options });
	return {
		ok: true,
		status: 200,
		json: async () => ({ success: { url, method: options.method, body: options.body || '' } })
	};
});

const entity = await api.entity({ type: 'post', id: 'p1', heichelId: 'study' }, {
	viewerAliasId: 'mine',
	includeRelations: true
});
assert.ok(entity.url.includes('type=post'));
assert.ok(entity.url.includes('viewerAliasId=mine'));
assert.ok(entity.url.includes('relations=1'));

const batch = await api.batch([{ type: 'post', id: 'p2', heichelId: 'study' }], {
	viewerAliasId: 'mine',
	includeRelations: false
});
assert.equal(batch.method, 'POST');
assert.ok(batch.body.includes('includeRelations=false'));
assert.ok(batch.body.includes('viewerAliasId=mine'));

const failing = new YesodSocialKernelApi(async () => ({
	ok: true,
	status: 200,
	json: async () => ({ error: { message: 'Denied by capability law.' } })
}));
await assert.rejects(() => failing.entity({ type: 'post', id: 'p1' }), /Denied by capability law/);
console.log('B"H SocialKernelApi.test passed');
