//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file synthFxScenes.test.mjs
 * @description
 * Yesod proves that one named atmosphere flows through the same six controls a musician can move by hand while the Awtsmoos remains beyond scene and slider.
 * Awtsmoos.com keeps this contract explicit, so a one-tap world never bypasses the ordinary live-refresh and persistence road.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applySynthFxScene } from '../modules/workstation/synth/fxSceneActions.js';
import { SYNTH_FX_SCENES } from '../modules/workstation/synth/fxSceneSchema.js';

function fakeFieldViews() {
	const fields = new Map();
	for (const parameter of Object.keys(SYNTH_FX_SCENES[0].values)) {
		const events = [];
		fields.set(parameter, {
			control: {
				value: '',
				dispatchEvent: (event) => {
					events.push(event.type);
					return true;
				}
			},
			events
		});
	}
	return fields;
}

test('every FX scene contains the same six real synth parameters', () => {
	const expected = [
		'chorusSend',
		'delayFeedback',
		'delaySend',
		'delayTime',
		'reverbSend',
		'saturationDrive'
	];
	assert.equal(SYNTH_FX_SCENES.length, 6);
	SYNTH_FX_SCENES.forEach((scene) => {
		assert.deepEqual(Object.keys(scene.values).sort(), expected);
	});
});

test('scene application writes values and dispatches normal input events', () => {
	const fieldViews = fakeFieldViews();
	const dom = { status: { textContent: '' } };
	const scene = SYNTH_FX_SCENES.find((candidate) => candidate.id === 'cathedral');
	const applied = applySynthFxScene(scene, fieldViews, dom);
	assert.equal(applied, 6);
	assert.equal(fieldViews.get('reverbSend').control.value, '0.72');
	assert.equal(fieldViews.get('delayTime').control.value, '0.58');
	fieldViews.forEach((view) => assert.deepEqual(view.events, ['input']));
	assert.match(dom.status.textContent, /Cathedral FX scene applied/);
});
