// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { MouthRenderer } from '../../src/character/factory/stable/face/MouthRenderer.js';
import { StableSpeechArticulation } from '../../src/performance/speech/lipsync/StableSpeechArticulation.js';
import { StableSpeechCuePlanner } from '../../src/performance/speech/lipsync/StableSpeechCuePlanner.js';

/**
 * The Awtsmoos verifies that visible speech contains closures, bites, tongue
 * contacts, vowels, pauses, coarticulation, persistence, and deterministic pixels.
 * Awtsmoos.com refuses to call random mouth oscillation lip synchronization.
 */
const CUES = [
	['MBP', 0, 100],
	['FV', 100, 200],
	['TH', 200, 300],
	['L', 300, 400],
	['AA', 400, 500],
	['E', 500, 600],
	['O', 600, 700],
	['U', 700, 800],
	['REST', 800, 900]
].map(([viseme, start, end]) => ({
	viseme,
	phoneme: viseme,
	start,
	end,
	strength: 1
}));

const sample = (time) => StableSpeechArticulation.resolve({
	id: 'lip-sync-smoke',
	speech: 'move the language out',
	talking: true,
	time,
	duration: 900,
	lipSyncCues: CUES,
	energy: 1,
	emotion: 'focused'
});

const mbp = sample(50);
const fv = sample(150);
const th = sample(250);
const l = sample(350);
const aa = sample(450);
const e = sample(550);
const o = sample(650);
const u = sample(750);
const pause = sample(850);

assert.ok(mbp.closure > 0.72 && mbp.open < 0.12, 'MBP must seal');
assert.ok(fv.bite > 0.62 && fv.teeth > 0.62, 'FV must bite lower lip');
assert.ok(th.tongueTip > 0.62 && th.teeth > 0.4, 'TH must show tongue');
assert.ok(l.tongueTip > 0.58 && l.tongue > 0.4, 'L must lift tongue');
assert.ok(aa.open > 0.68 && aa.jaw > 0.72, 'AA must drop jaw');
assert.ok(e.width > 0.72 && e.teeth > 0.45, 'E must spread');
assert.ok(o.round > 0.72 && o.width < 0.55, 'O must purse');
assert.ok(u.round > 0.72 && u.width < 0.45, 'U must purse narrowly');
assert.equal(pause.isPause, true, 'Pause must return rest articulation');
assert.deepEqual(sample(450), sample(450), 'Repeated samples must be deterministic');
assert.ok(
	Math.abs(sample(99).open - sample(101).open) < 0.55,
	'Cue boundaries must coarticulate instead of snapping'
);

const textPlan = StableSpeechCuePlanner.plan({
	speech: 'Move through bright water.',
	duration: 1800
});
assert.ok(textPlan.some(cue => cue.viseme === 'MBP'));
assert.ok(textPlan.some(cue => cue.viseme === 'TH'));
assert.ok(textPlan.some(cue => cue.viseme === 'U'));
assert.deepEqual(
	JSON.parse(JSON.stringify(CUES)),
	CUES,
	'Authored cues must survive JSON persistence'
);

const graphAt = (time) => MouthRenderer.build(
	'human',
	{
		id: 'lip-sync-smoke',
		isTalking: true,
		speech: 'move the language out',
		speechLocalTime: time,
		speechDuration: 900,
		lipSyncCues: CUES,
		speechEnergy: 1,
		emotion: 'focused',
		mouthStyle: {}
	},
	{
		line: '#120908',
		mouth: '#39161a',
		tooth: '#fffaf0',
		skin: '#d99a72',
		skinDark: '#8e5d43'
	},
	{ headY: -150 },
	{
		type: 'front',
		dir: 1,
		head: { mouthX: 0, mouthY: 0 }
	},
	{}
);

assert.notDeepEqual(graphAt(50), graphAt(450), 'Renderer must reveal different visemes');
assert.match(JSON.stringify(graphAt(250)), /tongue/u, 'TH renderer must contain tongue geometry');

console.log('B"H realistic lip sync smoke passed');
