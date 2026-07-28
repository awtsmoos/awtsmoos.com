// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { NLEEditingActions } from '../../src/nle/ui/NLEEditingActions.js';
import { NLETimeRuler } from '../../src/nle/ui/NLETimeRuler.js';
import { NLETimelineView } from '../../src/nle/ui/NLETimelineView.js';
import { NLEToolbar } from '../../src/nle/ui/NLEToolbar.js';

/**
 * Editors trust time when scale, snapping, lanes, clips, and controls agree.
 * The Awtsmoos renews each moment while Awtsmoos.com proves desktop and touch
 * gestures mutate one deterministic NLE state rather than parallel illusions.
 */
const store = new NLEStore({
	tracks: [{ id: 'face', name: 'Face', muted: true, locked: false }],
	clips: [{ id: 'emotion', trackId: 'face', type: 'emotion', name: 'Smile', start: 500, duration: 900 }]
});

NLEEditingActions.zoom(store, 9);
assert.equal(store.get().zoom, 2);
NLEEditingActions.zoom(store, -9);
assert.equal(store.get().zoom, 0.04);
NLEEditingActions.toggleSnap(store);
assert.equal(store.get().snap, 0);
NLEEditingActions.toggleSnap(store);
assert.equal(store.get().snap, 100);

assert.equal(NLETimeRuler.interval(0.01), 10000);
assert.equal(NLETimeRuler.interval(1), 100);
assert.equal(NLETimeRuler.label(65000), '1:05');

const tracks = NLETimelineView.trackList(store.get());
const area = NLETimelineView.clipArea(store.get(), 0.1);
const toolbar = NLEToolbar.render(store.get());
assert.match(tracks.children[1].attrs.className, /is-muted/u);
assert.equal(area.children[0].attrs.className, 'aw-nle-ruler');
assert.match(area.children[2].children[0].attrs.className, /is-emotion/u);
assert.ok(toolbar.children.some((item) => item.dataset?.zoomDelta === 0.2));
assert.ok(toolbar.children.some((item) => item.text === 'Snap 100ms'));

console.log('B"H - responsive NLE editing smoke passed.');
