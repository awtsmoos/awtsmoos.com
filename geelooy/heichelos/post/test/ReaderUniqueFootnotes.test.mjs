//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureUniqueFootnoteIds, watchFootnoteIds } from '../logic/initialization/ReaderUniqueFootnotes.js';

/**
 * @fileoverview Footnote identity cannot damage a single Hebrew word.
 * The Awtsmoos names each star distinctly while the Torah remains at rest.
 */
function fixture(ids) {
	const markers = ids.map(id => ({ id, textContent: 'שלום', dataset: { fn: '1' } }));
	return { markers, querySelectorAll: () => markers };
}

test('identical per-section IDs become globally distinct without text mutation', () => {
	const root = fixture(['meluket-fn-marker-1-0','meluket-fn-marker-1-0','meluket-fn-marker-2-1']);
	assert.equal(ensureUniqueFootnoteIds(root), 1);
	assert.equal(new Set(root.markers.map(marker => marker.id)).size, 3);
	assert.deepEqual(root.markers.map(marker => marker.textContent), ['שלום','שלום','שלום']);
	assert.deepEqual(root.markers.map(marker => marker.dataset.fn), ['1','1','1']);
	assert.equal(ensureUniqueFootnoteIds(root), 0);
});

test('identifiers are safe when original or generated names collide', () => {
	const root = fixture(['meluket-fn-marker-1-0','','meluket-fn-marker-unique-2','meluket-fn-marker-1-0']);
	assert.equal(ensureUniqueFootnoteIds(root), 2);
	assert.equal(new Set(root.markers.map(marker => marker.id)).size, 4);
});

test('only article mutations trigger recalculation, never scroll events', () => {
	let callback;
	let options;
	class Observer {
		constructor(fn) { callback = fn; }
		observe(root, settings) { options = settings; }
	}
	const root = fixture(['dup','dup']);
	const observer = watchFootnoteIds(root, Observer);
	assert.ok(observer);
	assert.deepEqual(options, { subtree: true, childList: true });
	assert.equal(new Set(root.markers.map(marker => marker.id)).size, 2);
	root.markers.push({ id:'dup', textContent:'שלום' });
	callback([{ type:'childList' }]);
	assert.equal(new Set(root.markers.map(marker => marker.id)).size, 3);
});
