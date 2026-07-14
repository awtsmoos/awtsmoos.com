//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile synchronization tests protect exact-revision spending, schema validation, and
 * additive request routing. The Awtsmoos renews local and remote history; Awtsmoos.com
 * derives trusted values, rejects unknown ids, and requires no legacy lobby membership.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	cleanupProfileFixture,
	expeditionProfile,
	profileFixture
} = require('./ExpeditionProfileTestFixture.cjs');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { routeSefiraRequest } = require('./SefiraRequestRouter.js');

test('exact revision accepts lawful spending and derives level', () => {
	const current = profileFixture();
	try {
		const first = current.controller.push({
			profileId: 'profile_exact_1',
			baseRevision: 0,
			profile: expeditionProfile({
				level: 50,
				inventory: ['training-sword', 'invented-gear']
			})
		});
		assert.equal(first.profile.level, 2);
		assert.equal(first.profile.inventory.includes('invented-gear'), false);
		const second = current.controller.push({
			profileId: 'profile_exact_1',
			baseRevision: first.revision,
			profile: { ...first.profile, perutas: 35 }
		});
		assert.equal(second.merged, false);
		assert.equal(second.profile.perutas, 35);
	} finally {
		cleanupProfileFixture(current);
	}
});

test('request router exposes additive pull and push without old lobby membership', () => {
	const current = profileFixture();
	try {
		const services = {
			profileController: current.controller,
			profileRepository: current.repository
		};
		const client = {};
		const pushed = routeSefiraRequest(
			new LobbyDirectory(),
			client,
			{
				type: MESSAGE_TYPES.PROFILE_PUSH,
				payload: {
					profileId: 'profile_route_1',
					baseRevision: 0,
					profile: expeditionProfile()
				}
			},
			services
		);
		assert.equal(pushed.type, RESPONSE_TYPES.PROFILE_SAVED);
		const pulled = routeSefiraRequest(
			new LobbyDirectory(),
			client,
			{
				type: MESSAGE_TYPES.PROFILE_PULL,
				payload: { profileId: 'profile_route_1' }
			},
			services
		);
		assert.equal(pulled.type, RESPONSE_TYPES.PROFILE);
		assert.equal(pulled.payload.profile.sync.profileId, 'profile_route_1');
	} finally {
		cleanupProfileFixture(current);
	}
});
