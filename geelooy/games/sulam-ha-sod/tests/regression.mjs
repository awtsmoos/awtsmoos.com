// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';
import { buyLevelUnlock, levelUnlockCost, MARKET_SKINS, walletRows } from '../js/systems/market.js';

const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const coinRect = c => ({ x: c.x, y: c.y, w: 26, h: 26 });
const hazards = l => [...(l.spikes || []), ...(l.trickPlatforms || []).filter(t => ['falseSpike', 'ghostSpike', 'commitSpike'].includes(t.kind))];
const solids = l => [...(l.platforms || []), ...(l.trickPlatforms || []).filter(t => !['falseSpike', 'ghostSpike', 'phantom', 'commitSpike'].includes(t.kind))];

/**
 * Full campaign regression.
 *
 * The Awtsmoos now raises fifty-one chambers. Cruelty may scream, but it may
 * not mumble nonsense: no embedded coins, no solid-hazard overlaps, no missing
 * late mechanics, no broken market, and no unindexed enemy coin law.
 */
function testCampaignShape() {
  assert.equal(LEVELS.length, 51, 'campaign should have 51 chambers');
  LEVELS.forEach((level, i) => {
    assert.ok(/^\d+/.test(level.name), `${level.name} must be numbered`);
    assert.ok(level.width >= 2200 + i * 250, `${level.name} must grow wide enough`);
    assert.ok((level.platforms || []).length >= 7, `${level.name} needs route platforms`);
    assert.ok((level.spikes || []).length >= 1, `${level.name} needs spike pressure`);
    assert.ok((level.triggers || []).length >= 3, `${level.name} needs trigger pressure`);
    assert.ok((level.fakeCoins || []).length >= 2, `${level.name} needs fake rewards`);
    assert.ok((level.lore || []).length >= 3, `${level.name} needs lore warnings`);
    assert.ok((level.coins || []).some(c => c.kind === 'maneh'), `${level.name} needs a maneh lure`);
    if (i > 0) assert.ok((level.enemies || []).length >= 1, `${level.name} needs enemies`);
  });
}

function testMechanicsExist() {
  const kinds = new Set(LEVELS.flatMap(l => (l.trickPlatforms || []).map(t => t.kind)));
  for (const kind of ['ice', 'booster', 'phantom', 'falseSpike', 'shatter', 'vanish', 'commitDrop', 'reverseBooster', 'fakeCheckpoint', 'antiJump', 'antiSpeed', 'magnet', 'oneWay', 'safeSpike', 'baitShift']) assert.ok(kinds.has(kind), `missing ${kind}`);
  assert.ok(LEVELS.every(l => (l.trickPlatforms || []).some(t => t.kind === 'safeSpike')), 'every level needs a safe spike bridge');
  assert.ok(LEVELS.every(l => (l.trickPlatforms || []).some(t => t.kind === 'baitShift')), 'every level needs baitShift memory');
  assert.ok(LEVELS.every(l => (l.spikes || []).some(s => s.proximity)), 'every level needs proximity spikes');
  assert.ok(LEVELS.every(l => (l.triggers || []).some(t => (t.spikes || []).length >= 2)), 'every level needs spike-curtain triggers');
  assert.ok(LEVELS.slice(14).every(l => (l.trickCoins || []).length >= 4), 'late levels need trick coins');
  assert.ok(LEVELS.filter(l => (l.enemies || []).some(e => e.dropCoin)).length >= 28, 'many levels need enemy-held required coins');
}

function testLateBlocks() {
  assert.equal(LEVELS.filter(level => /Natural Chain/.test(level.name)).length, 5, 'Natural Chain should remain five levels');
  assert.equal(LEVELS.slice(33, 38).length, 5, 'levels 34-38 should remain');
  assert.equal(LEVELS.slice(38, 44).length, 6, 'levels 39-44 should remain');
  assert.equal(LEVELS.slice(44, 51).length, 7, 'levels 45-51 should exist');
  for (const level of LEVELS.slice(33)) {
    assert.ok((level.trickPlatforms || []).filter(t => t.kind === 'safeSpike').length >= 2, `${level.name} needs safe spike bridges`);
    assert.ok((level.trickPlatforms || []).filter(t => t.kind === 'baitShift').length >= 2, `${level.name} needs bait-shift memory`);
    assert.ok((level.enemies || []).filter(e => e.dropCoin).length >= 3, `${level.name} needs enemy-carried coins`);
    assert.ok((level.triggers || []).some(t => t.openExit), `${level.name} needs authored exit-opening pressure`);
  }
}

function testNoNonsenseOverlaps() {
  for (const level of LEVELS) {
    for (const s of solids(level)) for (const d of hazards(level)) assert.ok(!hit(s, d), `${level.name}: solid overlaps hazard at ${s.x},${s.y} with ${d.x},${d.y}`);
    for (const coin of [...(level.coins || []), ...(level.keys || []), ...(level.fakeCoins || [])]) {
      for (const s of solids(level)) assert.ok(!hit(coinRect(coin), s), `${level.name}: coin/key embedded in solid at ${coin.x},${coin.y}`);
      for (const d of hazards(level)) assert.ok(!hit(coinRect(coin), d), `${level.name}: coin/key embedded in hazard at ${coin.x},${coin.y}`);
    }
    const triggers = [...(level.triggers || [])].sort((a, b) => a.x - b.x);
    for (let i = 1; i < triggers.length; i += 1) assert.ok(triggers[i].x - triggers[i - 1].x >= 240, `${level.name}: trigger spam overlap`);
  }
}

function testSpecialPlatforms() {
  const field = new TrickPlatformField([{ x:0,y:100,w:80,h:16,kind:'ice' },{ x:120,y:100,w:80,h:16,kind:'booster',dir:1,boost:900,lift:40 },{ x:240,y:100,w:80,h:16,kind:'phantom' },{ x:360,y:100,w:80,h:16,kind:'falseSpike' },{ x:480,y:100,w:80,h:16,kind:'commitDrop' },{ x:600,y:100,w:80,h:16,kind:'reverseBooster',dir:1,boost:700 },{ x:720,y:100,w:80,h:16,kind:'safeSpike' },{ x:840,y:100,w:80,h:16,kind:'baitShift' }]);
  const player = { x: 0, y: 70, w: 34, h: 48, vx: 0, vy: 0 };
  assert.equal(field.bodies().some(p => p.kind === 'phantom'), false);
  assert.equal(field.bodies().some(p => p.kind === 'safeSpike'), true);
  assert.equal(field.hazardBodies().length, 1);
  field.land(field.bodies().find(p => p.kind === 'ice'), player);
  assert.ok(player.ice > 0);
  field.land(field.bodies().find(p => p.kind === 'booster'), player);
  assert.ok(player.vx >= 900 && player.vy < 0);
  field.land(field.bodies().find(p => p.kind === 'reverseBooster'), player);
  assert.ok(player.vx <= -700);
  assert.match(field.land(field.bodies().find(p => p.kind === 'commitDrop'), player), /commitment/);
  assert.match(field.land(field.bodies().find(p => p.kind === 'safeSpike'), player), /honest bridge/);
  assert.match(field.touchGhost({ x: 365, y: 90, w: 34, h: 48 }), /normal platform was spikes/);
}

function testWorldSystems() {
  const world = new PhysicsWorld(LEVELS.at(-1));
  for (let i = 0; i < 12; i += 1) world.step({ x: 1, jump: false, restart: false, ok: false }, 1 / 60);
  assert.ok(world.performance.totalPlatforms > 20);
  assert.ok(world.performance.platformChecks < world.performance.totalPlatforms);
  const carrierLevel = LEVELS.find(l => (l.enemies || []).some(e => e.dropCoin));
  const carrierWorld = new PhysicsWorld(carrierLevel);
  const carrier = carrierWorld.enemies.find(e => e.dropCoin);
  const before = carrierWorld.coins.length;
  carrierWorld.enemyStomp(carrierWorld.enemies.indexOf(carrier), carrier, { revives: false, stomp: 'test', stompable: true });
  assert.equal(carrierWorld.coins.length, before + 1);
}

function testMarketAndEnemyCatalog() {
  const state = { unlocked: 1, currency: { shefa: levelUnlockCost(2) }, market: { owned: ['plain'], equipped: 'plain', message: '' } };
  assert.equal(walletRows({ perutah: 2, dinar: 3, sela: 4, maneh: 5, shefa: 6 }).length, 5);
  for (const slot of ['robe', 'hat', 'mask']) assert.ok(new Set(MARKET_SKINS.map(item => item.slot)).has(slot));
  assert.equal(buyLevelUnlock(state, LEVELS.length).ok, true);
  const types = new Set(LEVELS.flatMap(l => (l.enemies || []).map(e => e.type)));
  for (const type of ['husk', 'scroll', 'thief', 'golem', 'ayin', 'gravity', 'feign', 'watcher', 'leaper', 'herder', 'baitGuard']) assert.ok(types.has(type));
}

testCampaignShape();
testMechanicsExist();
testLateBlocks();
testNoNonsenseOverlaps();
testSpecialPlatforms();
testWorldSystems();
testMarketAndEnemyCatalog();
console.log('Sulam HaSod regression ok: 51 chambers, late expansions, devil mechanics, market and physics');
