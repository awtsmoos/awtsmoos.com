// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { OutdoorProfessionalScene, OutdoorQualityGate } from '../../src/data/scenes/default/professional2d/outdoor/index.js';
import { ProfessionalQualityGate } from '../../src/data/scenes/default/professional2d/index.js';
import { ProfessionalWorkshopWorld } from '../../src/core/renderer/scene/worlds/ProfessionalWorkshopWorld.js';

const scene = OutdoorProfessionalScene.build();
const defaultAudit = ProfessionalQualityGate.audit(DEFAULT_SCENE);
const outdoorAudit = OutdoorQualityGate.audit(scene);
const blockedTerms = ['pi' + 'xar', 'dis' + 'ney', 'dream' + 'works', 'ghi' + 'bli', 'illu' + 'mination'];
const sceneText = JSON.stringify(scene).toLowerCase();
const calls = [];

const ctx = new Proxy({
  createLinearGradient: () => ({ addColorStop: (...args) => calls.push(['addColorStop', ...args]) }),
  createRadialGradient: () => ({ addColorStop: (...args) => calls.push(['addRadialColorStop', ...args]) })
}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return (...args) => calls.push([prop, ...args]);
  },
  set(target, prop, value) { target[prop] = value; calls.push(['set', prop, value]); return true; }
});

assert.equal(DEFAULT_SCENE.id, 'professional_outdoor_default_2d_storm_lantern_v1');
assert.equal(DEFAULT_SCENE.scene.style, 'professional_2d_workshop');
assert.equal(DEFAULT_SCENE.scene.environment, 'professional_2d_outdoor_plaza');
assert.equal(DEFAULT_SCENE.authoring.system, 'professionalDefault2D');
assert.equal(DEFAULT_SCENE.authoring.variant, 'outdoorStormPlaza');
assert.equal(Object.keys(DEFAULT_SCENE.initialCharacters).length, 5);
assert.equal(DEFAULT_SCENE.initialProps.length >= 20, true);
assert.equal(DEFAULT_SCENE.cameras.length >= 10, true);
assert.equal(DEFAULT_SCENE.events.length >= 35, true);
assert.equal(defaultAudit.ok, true);
assert.equal(defaultAudit.score, 100);
assert.equal(outdoorAudit.ok, true);
assert.equal(outdoorAudit.score, 100);
assert.equal(typeof ProfessionalWorkshopWorld.render, 'function');
assert.equal(blockedTerms.some(term => sceneText.includes(term)), false);
ProfessionalWorkshopWorld.render(ctx, DEFAULT_SCENE.scene, 1280, 720, 16600, { x: 20, y: 0, zoom: 1 });
assert.equal(calls.some(([name]) => name === 'fillRect'), true);
assert.equal(calls.some(([name]) => name === 'stroke'), true);
assert.equal(calls.length > 100, true);
console.log('B"H outdoor professional default smoke passed');
