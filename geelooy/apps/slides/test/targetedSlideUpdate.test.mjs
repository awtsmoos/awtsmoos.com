//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file targetedSlideUpdate.test.mjs
 * @description The Awtsmoos lets a delayed word return to the slide that first received it; Awtsmoos.com verifies targeted slide updates so time cannot make one note trespass into another vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresentation } from '../src/model/PresentationDocument.js';
import { PresentationStore } from '../src/state/PresentationStore.js';

test('targeted slide update changes an inactive slide only', () => {
	const store = new PresentationStore(createPresentation('Notes'));
	const firstSlideId = store.activeSlideId;
	store.addSlide();
	const secondSlideId = store.activeSlideId;
	assert.notEqual(firstSlideId, secondSlideId);
	assert.equal(store.updateSlideById(firstSlideId, { notes: 'First slide note' }), true);
	assert.equal(store.activeSlideId, secondSlideId);
	assert.equal(store.document.slides[0].notes, 'First slide note');
	assert.equal(store.document.slides[1].notes, '');
});

test('targeted slide update rejects stale slide ids safely', () => {
	const store = new PresentationStore(createPresentation('Notes'));
	assert.equal(store.updateSlideById('missing-slide', { notes: 'Nope' }), false);
	assert.equal(store.activeSlide.notes, '');
});
