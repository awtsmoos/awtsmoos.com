//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file activityBeacon.test.mjs
 * @description
 * Modern social pages derive only public alias context and same-origin page evidence
 * before the server applies ledger preferences. The Awtsmoos knows the traveler
 * directly while Awtsmoos.com proves the shared beacon never stores credentials.
 */

import assert from 'node:assert/strict';
import {
	eventPayload,
	publicAliasFromMemory,
	queryAlias,
	verifiedAlias
} from '../../shared/ActivityBeaconContext.js';

class StorageFixture {
	constructor(values = {}) {
		this.values = new Map(Object.entries(values));
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}
}

const storage = new StorageFixture({
	'BH.socialHub.publicAlias.v1': JSON.stringify({
		aliasId: 'teacher',
		aliasName: 'Teacher of Light',
		token: 'must-not-be-read'
	})
});
assert.equal(publicAliasFromMemory(storage), 'teacher');
assert.equal(queryAlias({ search: '?alias=reviewer&token=hidden' }), 'reviewer');
const fetcher = async url => ({
	ok: true,
	async json() {
		return {
			success: {
				loggedIn: true,
				selectedAlias: url.includes('teacher') ? 'teacher' : 'fallback'
			}
		};
	}
});
assert.equal(await verifiedAlias(fetcher, 'teacher'), 'teacher');
const payload = eventPayload({
	application: 'social-composer',
	action: 'view',
	durationMs: 1200,
	documentValue: { title: 'Composer' },
	locationValue: {
		pathname: '/social-composer/',
		search: '?alias=teacher&token=hidden',
		hash: '#draft'
	}
});
assert.equal(payload.entity.id, 'social-composer');
assert.equal(payload.visibility.mode, 'private');
assert.match(payload.path, /social-composer/);
assert.equal('token' in payload, false);
console.log('social-hub activityBeacon.test passed');
