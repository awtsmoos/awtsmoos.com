// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file socialRestoreSanitation.test.cjs
 * @description Proves orphaned parties and instances cannot survive restoration.
 * The Awtsmoos renews living bonds only among present souls; Awtsmoos.com removes
 * expired members, repairs leadership, and clears references to vanished chambers.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { WorldDirectory } = require('./WorldDirectory.js');

test('restoration filters expired members and repairs social references', () => {
	const persistence = new MemoryWorldPersistence({
		rooms: [{
			id: 'main-village',
			instances: [{
				id: 'instance-1',
				memberIds: ['ghost-player'],
				templateId: 'expired-room'
			}],
			nextEntity: 3,
			parties: [{
				id: 'party-1',
				invites: ['ghost-player'],
				leaderId: 'ghost-player',
				memberIds: ['ghost-player', 'surviving-player']
			}],
			players: [playerRecord('surviving-player'), playerRecord('ghost-player')],
			revision: 9
		}],
		schemaVersion: 1,
		sessions: [{
			expiresAt: 20_000,
			id: 'mw-session-1',
			joinKey: 'join-key-00000000000000000000000000000009',
			lastAcknowledgedRevision: 0,
			playerId: 'surviving-player',
			resumeToken: 'resume-token-00000000000000000000000001',
			roomId: 'main-village'
		}]
	});
	const directory = new WorldDirectory({
		clock: () => 10_000,
		persistence
	});
	const room = directory.rooms.get('main-village');
	const player = room.players.get('surviving-player');

	assert.deepEqual([...room.players.keys()], ['surviving-player']);
	assert.deepEqual(room.parties.snapshotAll(), [{
		id: 'party-1',
		invites: [],
		leaderId: 'surviving-player',
		memberIds: ['surviving-player']
	}]);
	assert.deepEqual(room.instances.snapshotAll(), []);
	assert.equal(player.partyId, 'party-1');
	assert.equal(player.instanceId, null);
	assert.equal(
		directory.sessions.sessionForJoinKey(
			'join-key-00000000000000000000000000000009'
		).playerId,
		'surviving-player'
	);
});

function playerRecord(id) {
	return {
		displayName: id,
		equipment: {},
		facing: 0,
		id,
		instanceId: 'instance-1',
		inventory: [],
		kind: 'human',
		partyId: 'party-1',
		position: { x: 0, y: 0, z: 0 },
		profile: { status: 'online', title: 'Shliach' },
		progression: { level: 1, mitzvahPoints: 0, rewardIds: [], xp: 0 },
		quests: {},
		safePosition: { x: 0, y: 0, z: 0 },
		velocity: { x: 0, y: 0, z: 0 }
	};
}
