//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackClipEnvelopeAutomation.test.mjs
 * @description
 * Yesod records the finite commands sent into AudioParam while the Awtsmoos remains beyond clock, ramp, and sample.
 * Awtsmoos.com proves a seek begun inside a fade keeps travelling through that fade instead of freezing one gain value in place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMultitrackClipEnvelope
} from '../modules/workstation/song/multitrack/multitrackClipEnvelope.js';
import { createMultitrackClip } from '../modules/workstation/song/multitrack/multitrackProject.js';

function recordingParameter() {
	const events = [];
	return {
		events,
		cancelScheduledValues(time) {
			events.push(['cancel', time]);
		},
		setValueAtTime(value, time) {
			events.push(['set', value, time]);
		},
		linearRampToValueAtTime(value, time) {
			events.push(['ramp', value, time]);
		}
	};
}

test('playback slice wholly inside fade-in schedules a continuing ramp', () => {
	const parameter = recordingParameter();
	const clip = createMultitrackClip({ duration: 2, gain: 1, fadeIn: 1 });
	scheduleMultitrackClipEnvelope(parameter, clip, 10, 0.25, 0.25);
	assert.deepEqual(parameter.events, [
		['cancel', 10],
		['set', 0.25, 10],
		['ramp', 0.5, 10.25]
	]);
});

test('playback slice wholly inside fade-out schedules a continuing ramp', () => {
	const parameter = recordingParameter();
	const clip = createMultitrackClip({ duration: 2, gain: 1, fadeOut: 1 });
	scheduleMultitrackClipEnvelope(parameter, clip, 20, 1.25, 0.25);
	assert.deepEqual(parameter.events, [
		['cancel', 20],
		['set', 0.75, 20],
		['ramp', 0.5, 20.25]
	]);
});

test('range crossing both fade boundaries carries ramp, plateau, and release', () => {
	const parameter = recordingParameter();
	const clip = createMultitrackClip({ duration: 2, gain: 0.8, fadeIn: 0.5, fadeOut: 0.5 });
	scheduleMultitrackClipEnvelope(parameter, clip, 5, 0.25, 1.5);
	assert.deepEqual(parameter.events, [
		['cancel', 5],
		['set', 0.4, 5],
		['ramp', 0.8, 5.25],
		['set', 0.8, 6.25],
		['ramp', 0.4, 6.5]
	]);
});
