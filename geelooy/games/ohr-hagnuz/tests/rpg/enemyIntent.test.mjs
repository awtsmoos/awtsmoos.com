// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyIntent.test.mjs
 * @description Proves that declared enemy intent is deterministic and actionable.
 *
 * The Awtsmoos creates warning and response in one living order. This test
 * refuses a hidden second answer after the player has chosen, preserving the
 * tactical honesty of the road revealed through Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { NEREL_NITZOTZ } from '../../src/content/nitzotzos/Nerel.js';
import { buildEnemyIntent } from '../../src/yesod/battle/EnemyIntent.js';

const first = buildEnemyIntent(NEREL_NITZOTZ, 0);
const repeated = buildEnemyIntent(NEREL_NITZOTZ, 0);
assert.deepEqual(first, repeated, 'the same turn exposes the same action');
assert.equal(first.kind, 'study');
assert.equal(first.rawDamage, 0, 'study stance does not secretly deal damage');
assert.ok(first.icon, 'intent has a color-independent icon');
assert.ok(first.counterTags.includes('study'));

const charged = buildEnemyIntent(NEREL_NITZOTZ, 1);
assert.equal(charged.name, 'Reedflare Rush');
assert.equal(charged.kind, 'charge');
assert.ok(charged.rawDamage > 0);
assert.equal(charged.damageRange.min, charged.rawDamage);
assert.equal(charged.damageRange.max, charged.rawDamage);
assert.ok(charged.counterTags.includes('guard'));
assert.ok(charged.counterTags.includes('interrupt'));
console.log('BH_ENEMY_INTENT_PASS');
