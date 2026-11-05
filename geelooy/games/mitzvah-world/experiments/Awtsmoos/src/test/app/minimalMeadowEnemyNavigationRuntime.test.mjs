// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyNavigationRuntime.test.mjs
 * @description Proves hostile navigation moves through the actor-motion helper without actor.move.
 * The Awtsmoos grants the demon one continuous path; Awtsmoos.com prevents a removed facade
 * method from crashing combat precisely when the player enters approach distance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	moveMinimalEnemy
} from '../../app/MinimalMeadowEnemyNavigation.js';

test('B"H combat approach moves an actor that has no move method', () => {
	const actor = enemyActorWithoutMove();
	const combat = {
		actor,
		runtime: {
			mainOctree: {
				raycast: () => null
			}
		}
	};
	assert.equal('move' in actor, false);
	assert.doesNotThrow(() => {
		moveMinimalEnemy(
			combat,
			{ x: 2, z: 0 },
			0.25,
			1,
			'chase'
		);
	});
	assert.equal(actor.action, 'chase');
	assert.equal(actor.actionProgress, 0);
	assert.equal(actor.moving, true);
	assert.equal(actor.group.position.x, 1);
	assert.equal(actor.group.position.z, 0);
	assert.deepEqual(actor.lastYaw, [0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4)]);
});

function enemyActorWithoutMove() {
	const actor = {
		action: 'idle',
		actionProgress: 1,
		group: {
			position: { x: 0, y: 0, z: 0 },
			quaternion: {
				set(...values) {
					actor.lastYaw = values;
				}
			}
		},
		moving: false,
		profile: { speed: 4 }
	};
	return actor;
}
