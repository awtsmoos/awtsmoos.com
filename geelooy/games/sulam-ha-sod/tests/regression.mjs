// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';
import { buyLevelUnlock, levelUnlockCost, MARKET_SKINS, walletRows } from '../js/systems/market.js';

const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const rectCoin = c => ({ x: c.x, y: c.y, w: 26, h: 26 });
const allTricks = level => level.trickPlatforms || [];
const hazards = level => [...(level.spikes || []), ...allTricks(level).filter(t => ['falseSpike', 'ghostSpike', 'commitSpike'].includes(t.kind))];
const solids = level => [...(level.platforms || []), ...allTricks(level).filter(t => !['falseSpike', 'ghostSpike', 'phantom', 'commitSpike'].includes(t.kind))];

/**
 * Regression suite for a cruel but readable ladder.
 *
 * The Awtsmoos allows deception, but not nonsense. Thirty-three chambers must
 * stay ordered, overlap-safe, coin-complete, market-aware, and rich with side
 * adventures that do not crush the authored main routes.
 */
function testCampaignShape() {
  assert.equal(LEVELS.length, 33, 'campaign should have 33 manually authored chambers');
  LEVELS.forEach((level, i) => {
    assert.ok(/^\d+/.test(level.name), `${level.name} must be ordered`);
    assert.ok(level.width >= 2200 + i * 250, `${level.name} must grow wider`);
    if (i > 0) assert.ok((level.enemies || []).length >= 1, `${level.name} should have authored enemies`);
    assert.ok((level.platforms || []).length >= 7, `${level.name} needs a readable platform route`);
    assert.ok((level.spikes || []).length >= 1, `${level.name} needs spike pressure`);
    assert.ok((level.triggers || []).length >= 3, `${level.name} needs invisible authored trigger pressure`);
    assert.ok((level.fakeCoins || []).length >= 2, `${level.name} needs more than one fake coin bite`);
    assert.ok((level.lore || []).length >= 3, `${level.name} needs hardening lore fragments`);
    assert.ok((level.coins || []).some(c => c.kind === 'maneh'), `${level.name} needs one maneh lure`);
  });
}

function testNewMechanicsExist() {
  const kinds = new Set(LEVELS.flatMap(l => (l.trickPlatforms || []).map(t => t.kind)));
  for (const kind of ['ice', 'booster', 'phantom', 'falseSpike', 'shatter', 'vanish', 'commitDrop', 'reverseBooster', 'fakeCheckpoint', 'antiJump', 'antiSpeed', 'magnet', 'oneWay']) assert.ok(kinds.has(kind), `missing ${kind}`);
  assert.ok(LEVELS.every(l => (l.trickPlatforms || []).some(t => t.kind === 'falseSpike')), 'every level should contain a platform-shaped spike lie');
  assert.ok(LEVELS.every(l => (l.triggers || []).some(t => (t.spikes || []).length >= 3)), 'every level should contain a spike-curtain trigger');
  assert.ok(LEVELS.slice(3).every(l => (l.trickPlatforms || []).some(t => t.kind === 'ice')), 'levels 4+ should include ice/slippery play');
  assert.ok(LEVELS.slice(3).every(l => (l.trickPlatforms || []).some(t => t.kind === 'booster')), 'levels 4+ should include booster play');
  assert.ok(LEVELS.slice(14).every(l => (l.trickCoins || []).length >= 4), 'late levels need cruel trick coin routes');
  assert.ok(LEVELS.filter(l => (l.enemies || []).some(e => e.dropCoin)).length >= 16, 'many levels should include enemy-swallowed required coins');
}

function testNaturalChainExists() {
  const chain = LEVELS.filter(level => /Natural Chain/.test(level.name));
  assert.equal(chain.length, 5, 'Natural Chain should remain five authored levels');
  chain.forEach(level => {
    assert.ok((level.trickPlatforms || []).some(t => t.kind === 'oneWay'), `${level.name} needs vertical one-way play`);
    assert.ok((level.enemies || []).some(e => e.dropCoin), `${level.name} needs enemy-carried required coins`);
    assert.ok(level.width >= 14000, `${level.name} should feel late-campaign huge`);
  });
}

function testNewLateBlockExists() {
  const late = LEVELS.slice(29);
  assert.equal(late.length, 4, 'four new late-game levels should be appended');
  for (const level of late) {
    assert.ok(/Sky Oath|Echo Orchard|Cave of Breath|Last Ladder/.test(level.name), `${level.name} is not one of the new chambers`);
    assert.ok((level.trickPlatforms || []).some(t => t.kind === 'oneWay'), `${level.name} needs one-way side climbing`);
    assert.ok((level.enemies || []).some(e => e.dropCoin), `${level.name} needs enemy-held required coins`);
    assert.ok((level.fakeCoins || []).length >= 3, `${level.name} needs multiple fake rewards`);
    assert.ok((level.triggers || []).some(t => (t.spikes || []).length >= 3), `${level.name} needs a falling surprise curtain`);
  }
}

function testNoNonsenseOverlaps() {
  for (const level of LEVELS) {
    const solid = solids(level), danger = hazards(level), coins = [...(level.coins || []), ...(level.keys || []), ...(level.fakeCoins || [])];
    for (const s of solid) for (const d of danger) assert.ok(!hit(s, d), `${level.name}: solid overlaps hazard at ${s.x},${s.y} with ${d.x},${d.y}`);
    for (const coin of coins) {
      const cr = rectCoin(coin);
      for (const s of solid) assert.ok(!hit(cr, s), `${level.name}: coin/key embedded in solid at ${coin.x},${coin.y}`);
      for (const d of danger) assert.ok(!hit(cr, d), `${level.name}: coin/key embedded in hazard at ${coin.x},${coin.y}`);
    }
    const triggers = [...(level.triggers || [])].sort((a, b) => a.x - b.x);
    for (let i = 1; i < triggers.length; i += 1) assert.ok(triggers[i].x - triggers[i - 1].x >= 250, `${level.name}: trigger spam overlap`);
  }
}

function testSpecialPlatformBehavior() {
  const field = new TrickPlatformField([
    { x: 0, y: 100, w: 80, h: 16, kind: 'ice' }, { x: 120, y: 100, w: 80, h: 16, kind: 'booster', dir: 1, boost: 900, lift: 40 },
    { x: 240, y: 100, w: 80, h: 16, kind: 'phantom' }, { x: 360, y: 100, w: 80, h: 16, kind: 'falseSpike' },
    { x: 480, y: 100, w: 80, h: 16, kind: 'commitDrop' }, { x: 600, y: 100, w: 80, h: 16, kind: 'reverseBooster', dir: 1, boost: 700 }
  ]);
  const player = { x: 0, y: 70, w: 34, h: 48, vx: 0, vy: 0 };
  assert.equal(field.bodies().some(p => p.kind === 'phantom'), false, 'phantom platforms must not be solid');
  assert.equal(field.bodies().some(p => p.kind === 'falseSpike'), false, 'falseSpike must not be solid');
  assert.equal(field.hazardBodies().length, 1, 'falseSpike must expose a hazard body');
  field.land(field.bodies().find(p => p.kind === 'ice'), player);
  assert.ok(player.ice > 0, 'ice should apply slide state');
  field.land(field.bodies().find(p => p.kind === 'booster'), player);
  assert.ok(player.vx >= 900 && player.vy < 0, 'booster should shove/lift player');
  field.land(field.bodies().find(p => p.kind === 'reverseBooster'), player);
  assert.ok(player.vx <= -700, 'reverse booster should punish forward expectation');
  assert.match(field.land(field.bodies().find(p => p.kind === 'commitDrop'), player), /commitment/);
  assert.match(field.touchGhost({ x: 365, y: 90, w: 34, h: 48 }), /normal platform was spikes/);
}

function testPhysicsStillRuns() {
  const world = new PhysicsWorld(LEVELS.at(-1));
  for (let i = 0; i < 12; i += 1) world.step({ x: 1, jump: false, restart: false, ok: false }, 1 / 60);
  assert.ok(world.performance.totalPlatforms > 20, 'final level has many spatial bodies');
  assert.ok(world.performance.platformChecks < world.performance.totalPlatforms, 'spatial query narrows checks');
}

function testHebrewDeathBurst() {
  const world = new PhysicsWorld(LEVELS[0]);
  world.player.x = 160;
  world.player.y = 430;
  world.visibleCameraY = -123;
  world.loseMoneyAndReset('Test spike shattered the vessel.');
  assert.equal(world.deathPause.cameraY, -123, 'death should freeze vertical camera too');
  assert.ok(world.deathBursts.length >= 1, 'death should leave a visible burst after reset');
  const particles = world.deathBursts.at(-1).particles;
  assert.ok(particles.some(p => p.letter), 'death burst should include Hebrew letters');
  assert.ok(particles.some(p => !p.letter), 'death burst should include block shards');
}

function testEnemyCoinDrop() {
  const level = LEVELS.find(l => (l.enemies || []).some(e => e.dropCoin));
  const world = new PhysicsWorld(level);
  const carrier = world.enemies.find(e => e.dropCoin);
  const before = world.coins.length;
  world.enemyStomp(world.enemies.indexOf(carrier), carrier, { revives: false, stomp: 'test', stompable: true });
  assert.equal(world.coins.length, before + 1, 'stomping a carrier should drop a required real coin');
  assert.ok(world.realCoinTotal > level.coins.length, 'enemy-held coins count toward the door lock');
}

function testMarketUnlocksAndItems() {
  const state = { unlocked: 1, currency: { shefa: levelUnlockCost(2) }, market: { owned: ['plain'], equipped: 'plain', message: '' } };
  const rows = walletRows({ perutah: 2, dinar: 3, sela: 4, maneh: 5, shefa: 6 });
  assert.equal(rows.length, 5, 'store should expose a full coin breakdown');
  assert.equal(rows.find(row => row.key === 'maneh').total, 500, 'menu should expose coin value totals');
  assert.ok(levelUnlockCost(5) > levelUnlockCost(4), 'forbidden gate prices should rise');
  const slots = new Set(MARKET_SKINS.map(item => item.slot));
  for (const slot of ['robe', 'hat', 'mask']) assert.ok(slots.has(slot), `shop needs ${slot} items`);
  assert.ok(MARKET_SKINS.length >= 10, 'shop should include many cosmetics');
  const result = buyLevelUnlock(state, LEVELS.length);
  assert.equal(result.ok, true, 'store should allow buying the next locked level with enough Shefa');
  assert.equal(state.unlocked, 2, 'paid unlock should open exactly one next level');
  assert.equal(state.currency.shefa, 0, 'paid unlock should subtract the cost');
}

function testEnemyCatalog() {
  const enemyTypes = new Set(LEVELS.flatMap(l => (l.enemies || []).map(e => e.type)));
  for (const t of ['husk', 'scroll', 'thief', 'golem', 'ayin', 'gravity', 'feign', 'watcher', 'leaper', 'herder', 'baitGuard']) assert.ok(enemyTypes.has(t), 'missing enemy type ' + t);
}

testCampaignShape();
testNewMechanicsExist();
testNaturalChainExists();
testNewLateBlockExists();
testEnemyCatalog();
testNoNonsenseOverlaps();
testSpecialPlatformBehavior();
testPhysicsStillRuns();
testHebrewDeathBurst();
testEnemyCoinDrop();
testMarketUnlocksAndItems();
console.log('Sulam HaSod regression ok: 33 cruel levels, richer surprises, store unlocks, cosmetics, wallet breakdown');
