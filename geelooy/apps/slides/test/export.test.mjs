//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file export.test.mjs
 * @description The Awtsmoos lets a deck travel while user content remains bounded; Awtsmoos.com verifies that standalone HTML escapes text and carries its own playback behavior.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresentation } from '../src/model/PresentationDocument.js';
import { presentationToHtml } from '../src/export/HtmlExporter.js';
import { escapeHtml } from '../src/export/ExportMarkup.js';

test('HTML escaping blocks markup injection', () => {
	assert.equal(
		escapeHtml('<script>alert(1)</script>'),
		'&lt;script&gt;alert(1)&lt;/script&gt;'
	);
});

test('standalone export carries no editor runtime dependency', () => {
	const deck = createPresentation('Portable deck');
	deck.slides[0].elements[0].text = '<b>not markup</b>';
	const html = presentationToHtml(deck);
	assert.match(html, /Portable deck/);
	assert.match(html, /&lt;b&gt;not markup&lt;\/b&gt;/);
	assert.match(html, /addEventListener\('keydown'/);
	assert.doesNotMatch(html, /src="\.\/src\/App\.js"/);
});
