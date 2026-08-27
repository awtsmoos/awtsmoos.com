//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file store.test.mjs
 * @description The Awtsmoos renews actions without erasing their trace; Awtsmoos.com verifies slide lifecycle, ordering, element mutation, duplication, layering, and bounded undo at the domain layer.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresentation } from '../src/model/PresentationDocument.js';
import { PresentationStore } from '../src/state/PresentationStore.js';

test('slide lifecycle preserves a usable deck', () => {
	const store = new PresentationStore(createPresentation());
	store.addSlide();
	assert.equal(store.document.slides.length, 2);
	store.duplicateSlide();
	assert.equal(store.document.slides.length, 3);
	store.deleteSlide();
	assert.equal(store.document.slides.length, 2);
	assert.ok(store.activeSlide);
});

test('slide ordering preserves active slide and can be undone', () => {
	const store = new PresentationStore(createPresentation());
	store.addSlide();
	store.addSlide();
	const originalOrder = store.document.slides.map(slide => slide.id);
	const activeId = store.activeSlideId;
	assert.equal(store.moveSlide(activeId, 0), true);
	assert.equal(store.document.slides[0].id, activeId);
	assert.equal(store.activeSlideId, activeId);
	store.undo();
	assert.deepEqual(
		store.document.slides.map(slide => slide.id),
		originalOrder
	);
});

test('active slide moves up and down within deck bounds', () => {
	const store = new PresentationStore(createPresentation());
	store.addSlide();
	store.addSlide();
	const activeId = store.activeSlideId;
	assert.equal(store.moveActiveSlide('up'), true);
	assert.equal(store.activeSlideIndex, 1);
	assert.equal(store.moveActiveSlide('down'), true);
	assert.equal(store.activeSlideIndex, 2);
	assert.equal(store.activeSlideId, activeId);
});

test('element edits can be undone', () => {
	const store = new PresentationStore(createPresentation());
	store.addElement('text', { text: 'Before' });
	const id = store.selectedElement.id;
	store.updateElement(id, { text: 'After' });
	assert.equal(store.selectedElement.text, 'After');
	store.undo();
	assert.equal(store.selectedElement.text, 'Before');
});

test('stale element updates are ignored safely', () => {
	const store = new PresentationStore(createPresentation());
	assert.doesNotThrow(() => {
		store.updateElement('missing-element', { x: 50 });
	});
});

test('selected elements duplicate with a new id and visible offset', () => {
	const store = new PresentationStore(createPresentation());
	store.addElement('shape', { x: 20, y: 30 });
	const source = store.selectedElement;
	const duplicateId = store.duplicateSelectedElement();
	const duplicate = store.selectedElement;
	assert.notEqual(duplicateId, source.id);
	assert.equal(duplicate.x, source.x + 2);
	assert.equal(duplicate.y, source.y + 2);
	assert.equal(store.activeSlide.elements.length, 4);
});

test('layer ordering moves selected element and remains undoable', () => {
	const store = new PresentationStore(createPresentation());
	store.addElement('text', { text: 'Layer target' });
	const targetId = store.selectedElement.id;
	assert.equal(store.activeSlide.elements.at(-1).id, targetId);
	store.moveSelectedElementLayer('back');
	assert.equal(store.activeSlide.elements[0].id, targetId);
	store.undo();
	assert.equal(store.activeSlide.elements.at(-1).id, targetId);
});
