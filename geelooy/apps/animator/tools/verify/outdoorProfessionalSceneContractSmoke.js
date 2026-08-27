// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { OutdoorBeats, OUTDOOR_EXPRESSIONS, OUTDOOR_WEATHER } from '../../src/data/scenes/default/professional2d/outdoor/index.js';

const ids = new Set(Object.keys(DEFAULT_SCENE.initialCharacters));
const propIds = new Set(DEFAULT_SCENE.initialProps.map(prop => prop.id));
const cameraIds = new Set(DEFAULT_SCENE.cameras.map(cam => cam.id));
const cameraAts = DEFAULT_SCENE.cameras.map(cam => cam.at);
const sourceBeats = OutdoorBeats.defaultBeats();

assert.equal(DEFAULT_SCENE.scene.parallax.length >= 7, true);
assert.equal(DEFAULT_SCENE.scene.weather.lightBeats.length, OUTDOOR_WEATHER.lightBeats.length);
assert.deepEqual(Object.keys(OUTDOOR_EXPRESSIONS).sort(), [...ids].sort());
for (const character of Object.values(DEFAULT_SCENE.initialCharacters)) {
  assert.equal(Boolean(character.expressionSet), true, `${character.id} expressionSet`);
  assert.equal(Boolean(character.expressionProfile?.microAction), true, `${character.id} microAction`);
  assert.equal(Boolean(character.silhouetteShape), true, `${character.id} silhouette`);
  assert.equal(Boolean(character.physics?.overlap), true, `${character.id} overlap`);
}
for (const prop of ['storm_lantern', 'blue_storm_core', 'wet_plaza_puddle_big', 'lantern_gold_bloom']) assert.ok(propIds.has(prop), prop);
for (const cam of ['opening_cliff_plaza_wide', 'circle_of_hands_overhead', 'final_rain_glow_wide']) assert.ok(cameraIds.has(cam), cam);
assert.deepEqual([...cameraAts].sort((a, b) => a - b), cameraAts);
assert.equal(sourceBeats.every(beat => beat.weatherCue === true), true);
assert.equal(sourceBeats.some(beat => beat.prop), true);
assert.equal(DEFAULT_SCENE.events.some(event => event.prop), true);
assert.equal(DEFAULT_SCENE.scene.weather.lightningMoments.length >= 2, true);
console.log('B"H outdoor professional scene contract smoke passed');
