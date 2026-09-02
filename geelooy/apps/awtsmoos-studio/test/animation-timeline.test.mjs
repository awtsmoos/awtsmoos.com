//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animation-timeline.test.mjs
 * The Awtsmoos renews motion as ordered points while Awtsmoos.com binds canonical keyframes, derived tracks, and safe timeline styling into one river;
 * this witness proves both MovieDocument animation truth and the guarded declarative style contract required when those diamonds reach the browser giver.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioKeyframeActions } from '../src/actions/StudioKeyframeActions.js';
import { createStudioState } from '../src/StudioState.js';
import { createStudioClipStyle, createStudioKeyframeStyle } from '../src/layout/editor/StudioTrackLane.js';
import { deriveStudioTracks } from '../src/timeline/StudioTrackCatalog.js';

function createAnimationHarness() {
	const store = new AwtsmoosUiStore(createStudioState());
	const session = {
		runtime: {
			render() {
				return null;
			}
		}
	};
	return {
		store,
		actions: createStudioKeyframeActions(session)
	};
}

test('selected transform keyframe set writes canonical shared channels at playhead', () => {
	const { store, actions } = createAnimationHarness();
	store.setSilent('playhead', 2.5);
	actions.addTransformKeyframeSet({ store });
	const scene = store.get('movie').scenes.find(item => item.id === store.get('selectedSceneId'));
	const layer = scene.layers.find(item => item.id === store.get('selectedLayerId'));
	assert.ok(layer.keyframes.length >= 10);
	assert.ok(layer.keyframes.some(frame => frame.channel === 'transform.x'));
	assert.ok(layer.keyframes.some(frame => frame.channel === 'transform.rotationY'));
	assert.ok(layer.keyframes.every(frame => typeof frame.at === 'number'));
});

test('derived timeline exposes populated families and selected keyframe marks', () => {
	const { store, actions } = createAnimationHarness();
	actions.addTransformKeyframeSet({ store });
	const tracks = deriveStudioTracks(store.get('movie'));
	assert.deepEqual(tracks.map(track => track.id), ['graphics', 'world']);
	assert.ok(tracks.find(track => track.id === 'graphics').items.length > 0);
	assert.ok(tracks.find(track => track.id === 'world').items.length > 0);
	const selectedId = store.get('selectedLayerId');
	const item = tracks.flatMap(track => track.items).find(entry => entry.layerId === selectedId);
	assert.ok(item);
	assert.ok(item.keyframeMarks.length >= 10);
	assert.ok(item.keyframeMarks.every(mark => mark.left >= 0 && mark.left <= 100));
});

test('timeline inline styles obey AwtsmoosUI declarative-object policy', () => {
	const clipStyle = createStudioClipStyle({ start: 18, duration: 9 }, 180);
	const keyframeStyle = createStudioKeyframeStyle({ left: 37.5 });
	assert.deepEqual(clipStyle, {
		'--clip-left': '10%',
		'--clip-width': '5%'
	});
	assert.deepEqual(keyframeStyle, {
		'--key-left': '37.5%'
	});
	assert.equal(typeof clipStyle, 'object');
	assert.equal(typeof keyframeStyle, 'object');
});
