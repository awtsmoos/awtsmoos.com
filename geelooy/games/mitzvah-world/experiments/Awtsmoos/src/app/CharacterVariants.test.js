// B"H
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VARIANTS, variantNames, NODES, MATERIALS } from './CharacterVariants.js';
import { speakText, canTalk } from './TalkingMouth.js';

describe('CharacterVariants', () => {
	it('exposes four named variants', () => {
		assert.deepEqual(variantNames().sort(), ['casual', 'classic', 'modern', 'scholar']);
	});
	it('every variant declares beard/glasses/hat/tefillin/outfit', () => {
		for (const name of variantNames()) {
			const v = VARIANTS[name];
			assert.equal(typeof v.beard, 'boolean', name);
			assert.equal(typeof v.glasses, 'boolean', name);
			assert.ok(['tophat', 'yamulka', 'none'].includes(v.hat), name);
			assert.equal(typeof v.tefillin, 'boolean', name);
			assert.ok(v.outfit && typeof v.outfit.jacket === 'number', name);
		}
	});
	it('variants differ from each other', () => {
		const sig = v => [v.beard, v.glasses, v.hat, v.tefillin].join('|');
		const sigs = new Set(variantNames().map(n => sig(VARIANTS[n])));
		assert.ok(sigs.size >= 3, 'variants must be visually distinct');
	});
	it('node names match the authored GLB', () => {
		assert.equal(NODES.beard, 'Cube005');
		assert.equal(NODES.mustache, 'mustache');
		assert.equal(NODES.topHat, 'top-hat');
		assert.equal(NODES.yamulka, 'yarmalka');
	});
});

describe('TalkingMouth', () => {
	it('speakText returns a timed controller', () => {
		const fake = { traverse() {} };
		const t = speakText(fake, 'Shalom!');
		assert.ok(t.duration > 0.5, 'duration scales with text');
		assert.equal(typeof t.update, 'function');
		assert.equal(typeof t.stop, 'function');
		t.stop();
	});
	it('canTalk is false without morphs', () => {
		assert.equal(canTalk({ traverse() {} }), false);
	});
	it('canTalk detects the O morph', () => {
		const fake = { traverse(fn) { fn({ isMesh: true, morphTargetDictionary: { O: 0, S: 1 } }); } };
		assert.equal(canTalk(fake), true);
	});
});
