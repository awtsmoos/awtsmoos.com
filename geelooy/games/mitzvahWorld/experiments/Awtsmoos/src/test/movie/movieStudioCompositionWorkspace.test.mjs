// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioCompositionWorkspace.test.mjs
 * @description Proves accessible drafts, bounded form payloads, and lock-safe visible actions.
 * The Awtsmoos is beyond interface and potential; Awtsmoos.com verifies finite controls expose
 * honest nested-canvas authoring without identity collisions, unsupported sources, or silent lock bypass.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioCompositionActions } from '../../movie/MovieStudioCompositionActions.js';
import {
	movieStudioCompositionLayerPayload,
	movieStudioCompositionPayload
} from '../../movie/MovieStudioCompositionForm.js';
import { movieStudioCompositionMarkup } from '../../movie/MovieStudioCompositionMarkup.js';
import { MovieStudioCompositionSelection } from '../../movie/MovieStudioCompositionSelection.js';

const input = (value = '', checked = false) => ({ checked, value });

function view() {
	return {
		duration: input('12'), fps: input('24'), height: input('720'), id: input('main'),
		layerBlend: input('screen'), layerDuration: input('5'), layerId: input('title'),
		layerKind: input('text'), layerLocked: input('', true), layerLoop: input('', false),
		layerName: input('Title'), layerOpacity: input('0.75'), layerSource: input(''),
		layerStart: input('1'), layerText: input('B\"H'), name: input('Main'), width: input('1280')
	};
}

test('workspace markup offers explicit blank drafts and only implemented visible sources', () => {
	const markup = movieStudioCompositionMarkup();
	assert.match(markup, /data-composition-action="new"/);
	assert.match(markup, /data-composition-layer-action="new"/);
	assert.match(markup, /role="listbox"/);
	assert.match(markup, /aria-live="polite"/);
	assert.match(markup, /value="composition">Nested composition/);
	assert.doesNotMatch(markup, /value="media"/);
	assert.doesNotMatch(markup, /value="track"/);
});

test('draft selection does not collide with existing composition or layer identity', () => {
	const selection = new MovieStudioCompositionSelection();
	const catalog = [{ id: 'main', layers: [{ id: 'title' }] }];
	selection.reconcile(catalog);
	assert.equal(selection.compositionId, 'main');
	assert.equal(selection.layerId, 'title');
	selection.beginComposition();
	selection.reconcile(catalog);
	assert.equal(selection.compositionId, null);
	selection.complete('main');
	assert.equal(selection.beginLayer(), true);
	selection.reconcile(catalog);
	assert.equal(selection.layerId, null);
});

test('form payloads preserve composition and layer intent without executable values', () => {
	const fields = view();
	assert.deepEqual(movieStudioCompositionPayload(fields), {
		duration: 12, fps: 24, height: 720, id: 'main', name: 'Main', width: 1280
	});
	assert.deepEqual(movieStudioCompositionLayerPayload(fields), {
		blendMode: 'screen', duration: 5, id: 'title', kind: 'text', locked: true,
		loop: false, name: 'Title', opacity: 0.75, sourceId: null, start: 1, text: 'B\"H'
	});
});

test('visible actions open drafts and force only explicit unlock transitions', () => {
	const fields = view();
	const calls = [];
	const controller = {
		api: {
			get: () => ({ layers: [{ id: 'title', locked: true }] }),
			layers: {
				remove: (...args) => (calls.push(['remove', ...args]), { ok: true }),
				update: (...args) => (calls.push(['update', ...args]), { ok: true })
			}
		},
		beginComposition: () => calls.push(['new-composition']),
		beginLayer: () => calls.push(['new-layer']),
		finish: result => result,
		selectedCompositionId: 'main',
		selectedLayerId: 'title',
		status: () => null,
		view: fields
	};
	const actions = new MovieStudioCompositionActions(controller);
	actions.composition('new');
	actions.layer('new');
	actions.layer('update');
	assert.deepEqual(calls[2].at(-1), {});
	fields.layerLocked.checked = false;
	actions.layer('update');
	assert.deepEqual(calls[3].at(-1), { force: true });
	actions.layer('remove');
	assert.equal(calls[4].length, 3);
});
