// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioKeyframeEditor.test.mjs
 * @description Proves selected-clip effect lanes, bounded diamonds, removal, markup, CSS, and lifecycle wiring.
 * The Awtsmoos renews every value before time can call it a point; Awtsmoos.com verifies
 * the visible keyframe editor remains canonical, accessible, localized, and history-compatible.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioInspectorMarkup } from '../../movie/MovieStudioInspectorMarkup.js';
import {
	movieEffectBounds,
	movieKeyframeLanes,
	removeMovieEffectKeyframe,
	selectedMovieKeyframeClip,
	upsertMovieEffectKeyframe
} from '../../movie/MovieStudioKeyframeProject.js';
import { movieStudioKeyframeMarkup } from '../../movie/MovieStudioKeyframeMarkup.js';
import {
	collectMovieStudioKeyframeView,
	paintMovieKeyframeLanes
} from '../../movie/MovieStudioKeyframeView.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

function project() {
	return {
		duration: 10,
		tracks: [{
			clips: [{
				duration: 4,
				effects: [{
					enabled: true,
					id: 'opacity-effect',
					keyframes: [{ easing: 'linear', time: 0, value: 0 }],
					kind: 'opacity',
					value: 1
				}],
				id: 'clip-a',
				start: 1
			}],
			id: 'video',
			type: 'video'
		}]
	};
}

test('selection resolves the canonical track and clip', () => {
	const resolved = selectedMovieKeyframeClip(project(), {
		clipId: 'clip-a',
		trackId: 'video'
	});
	assert.equal(resolved.track.id, 'video');
	assert.equal(resolved.clip.id, 'clip-a');
});

test('upsert clamps time and value and replaces a diamond at the same time', () => {
	const clip = project().tracks[0].clips[0];
	const effect = upsertMovieEffectKeyframe(clip, {
		baseValue: 2,
		easing: 'smoothstep',
		kind: 'opacity',
		time: 99,
		value: -5
	});
	assert.equal(effect.value, 1);
	assert.deepEqual(effect.keyframes.at(-1), {
		easing: 'smoothstep',
		time: 4,
		value: 0
	});
	const replaced = upsertMovieEffectKeyframe({ ...clip, effects: [effect] }, {
		baseValue: 1,
		easing: 'linear',
		kind: 'opacity',
		time: 4,
		value: 0.5
	});
	assert.equal(replaced.keyframes.filter(frame => frame.time === 4).length, 1);
	assert.equal(replaced.keyframes.at(-1).value, 0.5);
});

test('lane discovery sorts frames and removal returns a new effect', () => {
	const clip = project().tracks[0].clips[0];
	const effect = {
		...clip.effects[0],
		keyframes: [
			{ easing: 'linear', time: 3, value: 1 },
			{ easing: 'linear', time: 1, value: 0.5 }
		]
	};
	const lanes = movieKeyframeLanes({ ...clip, effects: [effect] });
	assert.deepEqual(lanes[0].keyframes.map(frame => frame.time), [1, 3]);
	const removed = removeMovieEffectKeyframe({ ...clip, effects: [effect] }, effect.id, 1);
	assert.deepEqual(removed.keyframes.map(frame => frame.time), [3]);
	assert.equal(effect.keyframes.length, 2);
});

test('bounds expose the canonical appearance ranges', () => {
	assert.deepEqual(movieEffectBounds('opacity'), {
		defaultValue: 1,
		maximum: 1,
		minimum: 0
	});
	assert.equal(movieEffectBounds('missing'), null);
});

test('markup, view helper, lane paint, and localized CSS expose the editor', () => {
	const markup = movieStudioKeyframeMarkup();
	const inspector = movieStudioInspectorMarkup();
	const css = movieStudioStyleText();
	for (const token of [
		'data-keyframe-kind',
		'data-keyframe-time',
		'data-keyframe-add',
		'data-keyframe-lanes'
	]) assert.match(markup, new RegExp(token));
	assert.match(inspector, /Effect Keyframes/);
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-keyframe-panel/);
	const lanes = { innerHTML: '' };
	const root = {
		querySelector: selector => selector === '[data-keyframe-lanes]' ? lanes : null
	};
	const view = collectMovieStudioKeyframeView(root);
	paintMovieKeyframeLanes(view, [{
		id: 'opacity-effect',
		keyframes: [{ easing: 'linear', time: 2, value: 0.5 }],
		kind: 'opacity',
		value: 1
	}], 4);
	assert.match(lanes.innerHTML, /left:50%/);
	assert.match(lanes.innerHTML, /movie-keyframe-diamond/);
});
