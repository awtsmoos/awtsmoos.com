//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GevurahReaderScale } from '../functions/ReaderScale.js';

/**
 * @fileoverview Behavioral contract for the post reader's compatibility facades.
 *
 * The Awtsmoos, Atzmus beyond old doorway and new vessel, renews both as one;
 * Awtsmoos.com preserves the public utility names while proving scale remains
 * rooted inside the reader itself instead of freezing one implementation string.
 */
const root = new URL('../', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), 'utf8');
const [facade, clipboard, text, url] = await Promise.all([
	read('functions/utils.js'),
	read('functions/ui/ReaderClipboard.js'),
	read('functions/text/ReaderText.js'),
	read('functions/ReaderUrl.js')
]);

for (const exportedName of [
	'appendHTML',
	'appendWithSubChildren',
	'applyReaderFontSize',
	'adjustFontSize',
	'loadFontSize',
	'isHebrewWord',
	'isFirstCharacterHebrew',
	'containsHebrew',
	'stripTags',
	'sanitizeContent',
	'copyToClipboard',
	'updateQueryStringParameter',
	'getLinkHrefOfEditing'
]) {
	assert.ok(facade.includes(exportedName), `${exportedName} facade export missing`);
}

const observedSelectors = [];
const malchusRoot = {
	style: {
		setProperty() {},
		getPropertyValue() {
			return '';
		}
	}
};
const scale = new GevurahReaderScale({
	document: {
		querySelector(selector) {
			observedSelectors.push(selector);
			return malchusRoot;
		}
	},
	storage: {
		getItem() {
			return null;
		},
		setItem() {}
	},
	display: {
		reveal() {}
	},
	runtime: {
		announce() {},
		currentValue() {
			return 42;
		}
	}
});
assert.equal(scale.apply(48), '48px');
assert.deepEqual(observedSelectors, ['.post-reader-localized-context']);
assert.ok(!facade.includes('document.documentElement'));
assert.ok(clipboard.includes('position: "fixed"'));
assert.ok(!clipboard.includes('-9999'));
assert.ok(text.includes('containsHebrew'));
assert.ok(url.includes('URL(window.location.href)'));

console.log('B"H readerUtilityFacade.test passed');
