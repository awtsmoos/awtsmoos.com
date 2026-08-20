//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file document.test.mjs
 * @description The Awtsmoos renews a deck through creation and normalization; Awtsmoos.com verifies that useful imported structure survives while hostile or unbounded values lose their power.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createPresentation,
	normalizePresentation,
	PRESENTATION_VERSION
} from '../src/model/PresentationDocument.js';

test('starter presentation has a versioned editable slide', () => {
	const deck = createPresentation('Test deck');
	assert.equal(deck.version, PRESENTATION_VERSION);
	assert.equal(deck.title, 'Test deck');
	assert.equal(deck.slides.length, 1);
	assert.ok(deck.slides[0].elements.length >= 2);
	assert.equal(deck.slides[0].notes, '');
});

test('normalization repairs missing slides and unsafe background', () => {
	const deck = normalizePresentation({
		title: 'Imported',
		slides: [{ name: 'One', background: 'url(javascript:bad)' }]
	});
	assert.equal(deck.slides.length, 1);
	assert.equal(deck.slides[0].background, '#11121a');
	assert.equal(deck.title, 'Imported');
});

test('speaker notes survive normalization within a bounded payload', () => {
	const longNotes = 'n'.repeat(60000);
	const deck = normalizePresentation({
		slides: [{ notes: longNotes }]
	});
	assert.equal(deck.slides[0].notes.length, 50000);
	assert.equal(deck.slides[0].notes, longNotes.slice(0, 50000));
});

test('normalization keeps opacity and geometry bounded', () => {
	const deck = normalizePresentation({
		slides: [{
			elements: [{
				type: 'text',
				text: 'A',
				opacity: -50,
				x: 900,
				width: -20
			}]
		}]
	});
	const element = deck.slides[0].elements[0];
	assert.equal(element.opacity, 0.05);
	assert.equal(element.x, 200);
	assert.equal(element.width, 1);
});

test('unknown element fields and style injection are discarded', () => {
	const deck = normalizePresentation({
		slides: [{
			elements: [{
				type: 'video-script-widget',
				text: 'Safe text',
				fontFamily: 'Inter; background:url(https://evil.invalid/x)',
				color: 'red;position:fixed',
				align: 'expression(alert(1))',
				onclick: 'alert(1)'
			}]
		}]
	});
	const element = deck.slides[0].elements[0];
	assert.equal(element.type, 'text');
	assert.equal(element.fontFamily, 'Inter, ui-sans-serif, system-ui, sans-serif');
	assert.equal(element.color, '#f7f7fb');
	assert.equal(element.align, 'left');
	assert.equal('onclick' in element, false);
});

test('unsafe image schemes and invalid image enums are rejected', () => {
	const deck = normalizePresentation({
		slides: [{
			elements: [{
				type: 'image',
				src: 'javascript:alert(1)',
				fit: 'url(evil)',
				alt: 'Still safe text'
			}]
		}]
	});
	const image = deck.slides[0].elements[0];
	assert.equal(image.src, '');
	assert.equal(image.fit, 'cover');
	assert.equal(image.alt, 'Still safe text');
});
