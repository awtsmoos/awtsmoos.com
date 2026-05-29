// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PhysicsWorld } from '../js/core/physics.js';
import { Game } from '../js/core/game.js';

/**
 * Economy banking regression.
 *
 * The Awtsmoos makes greed provisional. A coin touched inside the level is not
 * yet owned; it rests in runCurrency until the door is completed. Menu exit or
 * death can erase it. Victory alone banks it, then adds the time bonus.
 */
const tinyLevel = {
  name: '00 · Banking Test',
  width: 900,
  spawn: { x: 40, y: 40 },
  door: { x: 760, y: 60, w: 44, h: 90 },
  law: 'Bank only at the door.',
  platforms: [{ x: 0, y: 120, w: 500, h: 20 }],
  rotatingPlatforms: [],
  trickPlatforms: [],
  coins: [{ x: 40, y: 40, kind: 'maneh' }],
  fakeCoins: [],
  keys: [{ x: 90, y: 40, kind: 'dinar' }],
  spikes: [],
  enemies: [],
  triggers: [],
  lore: ['bank', 'bonus', 'forfeit']
};

function testRunCoinsAreNotBankedImmediately() {
  const world = new PhysicsWorld(tinyLevel);
  world.currency.shefa = 10;
  world.collectStaticCoins();
  assert.equal(world.runCurrency.maneh, 1, 'collected coin should enter run purse');
  assert.equal(world.runCurrency.shefa, 100, 'run purse should know Shefa value');
  assert.equal(world.currency.shefa, 10, 'saved Shefa should not change until completion');
}

function testCompletionBanksRunAndBonus() {
  const world = new PhysicsWorld(tinyLevel);
  world.currency.shefa = 10;
  world.collectStaticCoins();
  world.levelElapsed = 12;
  const gameLike = Object.create(Game.prototype);
  const reward = Game.prototype.bankCompletionReward.call(gameLike, world);
  assert.equal(reward.banked, 100, 'completion banks run Shefa');
  assert.ok(reward.bonus > 0, 'fast completion gives a bonus');
  assert.equal(world.currency.maneh, 1, 'completion banks coin count');
  assert.equal(world.currency.shefa, 10 + 100 + reward.bonus, 'completion banks run plus bonus');
}

function testHamburgerMarkupAndCssExist() {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('css/modules/actions.css', 'utf8');
  assert.match(html, /id="actionsBtn"[^>]*class="hamburger"/, 'actions button should be one hamburger button');
  assert.match(html, /id="mainMenuAction"/, 'main menu should be first action option');
  assert.match(html, /id="exitConfirm"/, 'exit confirmation modal should exist');
  assert.match(html, /id="successBurst"/, 'success animation vessel should exist');
  assert.match(css, /position:fixed/, 'actions menu should escape clipped HUD with fixed positioning');
  assert.match(css, /starSeal:before/, 'six-sided star CSS should exist');
}

testRunCoinsAreNotBankedImmediately();
testCompletionBanksRunAndBonus();
testHamburgerMarkupAndCssExist();
console.log('Sulam HaSod economy banking and action menu regression ok');
