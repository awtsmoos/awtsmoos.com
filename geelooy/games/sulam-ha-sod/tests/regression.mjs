// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';
import { SpatialHash } from '../js/systems/spatialHash.js';
import { currencyHud } from '../js/systems/currency.js';
import { marketHud } from '../js/systems/market.js';

/**
 * Chapter 41: the test scroll learned to measure smoothness, not just cruelty.
 * Spatial courts, progress rivers, worker-prepared skies, and difficulty fire
 * must all exist before the Awtsmoos lets the ladder call itself lightning.
 */
function testLevelShapeAndDifficultyRamp(){
  assert.equal(LEVELS.length, 6, 'campaign should now have six escalating levels');
  for(const [i, level] of LEVELS.entries()){
    assert.ok(level.width >= 2200 + i * 250, `${level.name} should widen as difficulty rises`);
    assert.ok(level.rotatingPlatforms.length >= 2, `${level.name} needs cruel rotating platforms`);
    assert.ok(level.trickPlatforms.length >= 2, `${level.name} needs deceptive platforms`);
    assert.ok(level.spikes.length >= 3, `${level.name} needs fixed spike geometry`);
    assert.ok(level.coins.some(c=>c.kind === 'maneh'), `${level.name} needs a rare maneh`);
  }
  assert.ok(LEVELS.at(-1).spikes.length > LEVELS[0].spikes.length, 'final level should have more spike traps than first');
}

function testSpatialHashNarrowsQueries(){
  const hash = new SpatialHash(100).build([{x:0,y:0,w:20,h:20,id:'near'},{x:900,y:0,w:20,h:20,id:'far'}]);
  assert.deepEqual(hash.query({x:5,y:5,w:10,h:10}).map(x=>x.id), ['near'], 'spatial hash should return only nearby bodies');
}

function testCurrencyChain(){
  const world = new PhysicsWorld(LEVELS[0]); const coin = world.coins.find(c=>c.kind === 'maneh');
  world.player = {x:coin.x,y:coin.y-8,w:34,h:48,vx:0,vy:0,on:true,stomps:0,skin:world.player.skin};
  world.step({x:0,jump:false,restart:false,buy:false}, 1/60);
  assert.equal(world.currency.maneh, 1, 'maneh should collect into named pouch');
  assert.match(currencyHud(world.currency), /Shefa 100/, 'HUD should show sacred value');
}

function testDeathCostsInGameShefa(){
  const world = new PhysicsWorld(LEVELS[0]); world.currency.shefa = 50; world.player.y = 700;
  world.step({x:0,jump:false,restart:false,buy:false}, 1/60);
  assert.equal(world.currency.shefa, 41, 'falling should drain 18 percent rounded up');
  assert.match(world.message, /Lost 9 in-game Shefa/, 'loss message must say in-game Shefa');
}

function testMarketBuysAndCyclesSkin(){
  const world = new PhysicsWorld(LEVELS[0]); world.currency.shefa = 90;
  world.step({x:0,jump:false,restart:false,buy:true}, 1/60);
  assert.equal(world.market.equipped, 'ember', 'first affordable brutal market skin equips');
  assert.equal(world.currency.shefa, 55, 'ember costs 35 Shefa');
  world.step({x:0,jump:false,restart:false,buy:true}, 1/60);
  assert.equal(world.market.equipped, 'plain', 'unaffordable buy cycles owned skins');
  assert.match(marketHud(world.market, world.currency), /Skin Traveler White/, 'market HUD should show equipped skin');
}

function testTrickPlatformsShatterAndAmbush(){
  const field = new TrickPlatformField([{x:10,y:100,w:80,h:18,kind:'shatter',reform:2},{x:200,y:100,w:80,h:18,kind:'ambush',range:120,jump:90}]);
  const shatter = field.bodies()[0];
  assert.match(field.land(shatter), /shattered/, 'shatter platform should report breakage');
  assert.equal(field.bodies().some(p=>p.kind === 'shatter'), false, 'shattered platform should disappear');
  field.step(1/60,{x:210,y:80,w:34,h:48});
  assert.ok(field.bodies().find(p=>p.kind === 'ambush').y < 100, 'ambush platform should jump upward near player');
}

function testSpatialPhysicsCounters(){
  const world = new PhysicsWorld(LEVELS.at(-1));
  world.step({x:0,jump:false,restart:false,buy:false}, 1/60);
  assert.ok(world.performance.totalPlatforms > 10, 'hard level should have many platform bodies');
  assert.ok(world.performance.platformChecks < world.performance.totalPlatforms, 'spatial query should check fewer than all platforms');
  assert.ok(world.performance.difficulty >= 4, 'final level should report higher difficulty');
}

function testRendererAndWorkerSignals(){
  const renderer = readFileSync(new URL('../js/core/renderer.js', import.meta.url), 'utf8');
  const worker = readFileSync(new URL('../js/render/workerRenderer.js', import.meta.url), 'utf8');
  assert.match(renderer, /OffscreenCanvas/, 'renderer should use offscreen canvas when available');
  assert.match(renderer, /new Worker\(new URL\('\.\.\/render\/workerRenderer\.js'/, 'renderer should attempt worker background helper');
  assert.match(renderer, /workerReady/, 'renderer should safely track worker fallback');
  assert.match(worker, /primeBackground/, 'worker should support background precomputation');
}

function testProgressUiMarkup(){
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const game = readFileSync(new URL('../js/core/game.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../css/game.css', import.meta.url), 'utf8');
  assert.match(html, /id="progressFill"/, 'HUD should include progress fill');
  assert.match(html, /id="difficulty"/, 'HUD should include difficulty pill');
  assert.match(main, /progressFill: document\.getElementById\('progressFill'\)/, 'main wires progress fill');
  assert.match(game, /progressFill\.style\.width/, 'game updates progress bar width');
  assert.match(game, /Checks \$\{w\.performance\.platformChecks\}/, 'HUD should expose collision check count');
  assert.match(css, /backdrop-filter:blur/, 'new UI should use glass styling');
}

testLevelShapeAndDifficultyRamp(); testSpatialHashNarrowsQueries(); testCurrencyChain(); testDeathCostsInGameShefa(); testMarketBuysAndCyclesSkin(); testTrickPlatformsShatterAndAmbush(); testSpatialPhysicsCounters(); testRendererAndWorkerSignals(); testProgressUiMarkup();
console.log('Sulam HaSod regression ok: lightning spatial physics, worker/offscreen render path, progress HUD, hard levels');
