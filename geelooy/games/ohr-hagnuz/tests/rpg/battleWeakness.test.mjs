/** B"H - battle weakness regression */
import assert from 'node:assert/strict';
import { computeDebateDamage } from '../../src/yesod/equipment/DebateGarmentEffects.js';

const oldRandom = Math.random;
Math.random = () => 0.99;
const move = { name: 'Rambam Order', category: 'Rambam', routeTitle: 'Rambam', power: 20 };
const weakEnemy = { name: 'Merchant of Exchange', weakTo: 'Rambam', element: 'Transaction' };
const neutralEnemy = { name: 'Noise', weakTo: 'Niggun', element: 'Noise' };
const weak = computeDebateDamage(move, weakEnemy);
const neutral = computeDebateDamage(move, neutralEnemy);
Math.random = oldRandom;
assert.equal(weak.damage - neutral.damage, 10, 'weakness adds exact 10 damage');
assert.ok(weak.desc.includes('weakness opened'), 'weakness feedback text appears');
console.log('BH_BATTLE_WEAKNESS_TEST_PASS');
