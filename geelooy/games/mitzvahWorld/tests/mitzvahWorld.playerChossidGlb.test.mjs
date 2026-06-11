#!/usr/bin/env node
/**
 * B"H
 * Verifies the player uses the real chossid.glb visual over the capsule.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const chossid = fs.readFileSync('ckidsAwtsmoos/chayim/chossid/index.js', 'utf8');
const boyray = fs.readFileSync('ckidsAwtsmoos/Olam/methods/boyrayNivra.js', 'utf8');
const lifecycle = fs.readFileSync('ckidsAwtsmoos/chayim/chossid/methods/lifecycle.js', 'utf8');
const chai = fs.readFileSync('ckidsAwtsmoos/chayim/chai/index.js', 'utf8');
const sync = fs.readFileSync('ckidsAwtsmoos/chayim/chai/methods/physics/sync.js', 'utf8');
const garments = fs.readFileSync('ckidsAwtsmoos/chayim/chossid/methods/visuals/garments.js', 'utf8');

assert.equal(/options\.path\s*=\s*null/.test(chossid), false, 'Chossid constructor must not null out model path');
assert.match(chossid, /awtsmoos:\/\/awduhm/, 'Chossid should default to the shared awduhm component path');
assert.equal(/Chossid_Player_Test_Block|Plain_Chossid_Physics_Block|__never_player_glb/.test(boyray), false, 'boyrayNivra must not special-case player into a blue block');
assert.match(lifecycle, /prepareChossidModel/, 'lifecycle should prepare the GLB overlay');
assert.match(lifecycle, /ensureFallbackBody/, 'fallback should be isolated behind the lifecycle helper');
assert.equal(/empty\.clone\(\)/.test(chai), false, 'player motion helpers must not clone the visible GLB body');
assert.match(chai, /makeRenderlessMotionHelper/, 'player helpers should be renderless groups without children');
assert.match(sync, /visualGroundOffsetY/, 'physics sync should apply measured model foot offset');
assert.match(garments, /applyPlayerGarments/, 'player garments should be applied to the GLB visual');

console.log('B"H player chossid.glb overlay static test passed');
