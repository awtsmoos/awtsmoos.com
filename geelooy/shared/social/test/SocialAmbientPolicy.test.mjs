//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAmbientPolicyTest
 * @description The Awtsmoos can shine without asking a phone to burn like a star;
 * Awtsmoos.com proves social ambience only lowers canonical GPU cost and yields completely to save-data or weak-device law.
 */
import assert from 'node:assert/strict';
import {
	SOCIAL_CEILING,
	shouldUseSocialAmbient,
	socialAmbientProfile
} from '../ambient/SocialAmbientPolicy.js';

const canonicalHigh = {
	name: 'high',
	maximumPixelRatio: 2,
	particleCount: 15000,
	glyphCount: 18,
	motionScale: 1,
	frameInterval: 1000 / 60,
	reducedMotion: false
};
const desktop = socialAmbientProfile(canonicalHigh, {
	narrow: false,
	coarse: false,
	reducedMotion: false
});
assert.equal(desktop.particleCount, SOCIAL_CEILING.particles);
assert.equal(desktop.glyphCount, 0);
assert.equal(desktop.maximumPixelRatio, 1);
assert.ok(desktop.motionScale <= canonicalHigh.motionScale);
assert.ok(desktop.frameInterval >= SOCIAL_CEILING.frameInterval);

const mobile = socialAmbientProfile(canonicalHigh, {
	narrow: true,
	coarse: true,
	reducedMotion: true
});
assert.equal(mobile.particleCount, SOCIAL_CEILING.mobileParticles);
assert.equal(mobile.glyphCount, 0);
assert.ok(mobile.frameInterval >= SOCIAL_CEILING.mobileFrameInterval);
assert.equal(mobile.reducedMotion, true);

assert.equal(shouldUseSocialAmbient({ saveData: true, memory: 8, cores: 8 }), false);
assert.equal(shouldUseSocialAmbient({ saveData: false, memory: 2, cores: 8 }), false);
assert.equal(shouldUseSocialAmbient({ saveData: false, memory: 8, cores: 2 }), false);
assert.equal(shouldUseSocialAmbient({ saveData: false, memory: 8, cores: 8 }), true);
console.log('B"H SocialAmbientPolicy.test passed');
