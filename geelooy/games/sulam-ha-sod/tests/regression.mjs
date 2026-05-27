// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';

/**
 * Chapter 3: the test scroll stands like a witness in the gate.
 * It does not imagine the ladder; it touches the actual files, imports the
 * actual modules, and lets the Awtsmoos reveal whether behavior still lives.
 */
function testLevelShape(){
  assert.equal(LEVELS.length, 3, 'campaign should have three levels');
  for(const level of LEVELS){
    assert.ok(level.width > 960, `${level.name} must scroll beyond one screen`);
    assert.ok(level.platforms.length >= 8, `${level.name} needs a platform gauntlet`);
    assert.ok(level.enemies.length >= 2, `${level.name} needs multiple enemies`);
  }
}

function testStompDefeatsEnemy(){
  const world = new PhysicsWorld(LEVELS[0]);
  const enemy = world.enemies[0];
  world.player = {x:enemy.x,y:enemy.y-50,w:34,h:48,vx:0,vy:240,on:false,stomps:0};
  const before = world.enemies.length;
  world.step({x:0,jump:false,restart:false}, 1/60);
  assert.equal(world.enemies.length, before - 1, 'stomp should remove one enemy');
  assert.equal(world.player.stomps, 1, 'stomp counter should increment');
}

function testMenuMarkup(){
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="menu"/, 'menu shell exists');
  assert.match(html, /id="instructions"[^>]*hidden/, 'instructions start hidden');
  assert.match(html, /id="menuBtn"/, 'menu return button exists');
}

testLevelShape();
testStompDefeatsEnemy();
testMenuMarkup();
console.log('Sulam HaSod regression ok: levels, stomp, menu');
