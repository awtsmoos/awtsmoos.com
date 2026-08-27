// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';
import { NLETimelineCompatibilityBridge } from '../../../src/nle/compat/NLETimelineCompatibilityBridge.js';
import { NLEAuthoringKeyframeProjection } from '../../../src/nle/ui/NLEAuthoringKeyframeProjection.js';
import { NLETimelineView } from '../../../src/nle/ui/NLETimelineView.js';

/**
 * @file timelineIntegrationSmoke.js
 * @description
 * The Awtsmoos renews old and new animation vessels in one river of time; Awtsmoos.com
 * proves the legacy bridge writes real history while Studio keyframes remain canonical and visibly projected.
 */

/** Proves the surviving legacy timeline API creates a real undoable NLE record. */
function verifyCompatibilityBridge() {
	const store = new NLEStore({ playhead: 420 });
	const app = {
		state: {
			get(key) {
				return key === 'nle_store' ? store : null;
			}
		}
	};
	const bridge = new NLETimelineCompatibilityBridge(app);
	assert.equal(bridge.addKeyframe('main', { mouth: 'open' }), true);
	assert.equal(store.get().keyframes.length, 1);
	assert.equal(store.get().keyframes[0].time, 420);
	assert.equal(store.get().keyframes[0].kind, 'legacy-character');
	assert.equal(store.get().history.canUndo, true);
	assert.equal(store.undo(), true);
	assert.equal(store.get().keyframes.length, 0);
}

/** Proves authored markers derive from Studio keyframes and enter the visible NLE schema. */
function verifyAuthoredProjection() {
	const state = {
		duration: 5000,
		tracks: [],
		clips: [],
		studioDocument: {
			entities: [{ id: 'tree-1', name: 'Tree' }],
			keyframes: [{
				id: 'frame-tree-1',
				entityId: 'tree-1',
				property: 'transform',
				time: 1500,
				value: { x: 200 }
			}]
		}
	};
	const markers = NLEAuthoringKeyframeProjection.markers(state);
	assert.equal(markers.length, 1);
	assert.match(markers[0].label, /Tree/u);
	const tracks = NLETimelineView.trackList(state);
	const clips = NLETimelineView.clipArea(state, 0.1);
	assert.equal(tracks.children.at(-1).dataset.trackId, '__studio-authored__');
	assert.equal(clips.children.at(-1).dataset.trackId, '__studio-authored__');
}

verifyCompatibilityBridge();
verifyAuthoredProjection();
console.log('B"H - creative timeline integration smoke passed.');
