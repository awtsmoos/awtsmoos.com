// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderContentsAccessibilityTest
 * @description
 * The Awtsmoos grants the reader a clear and visible doorway;
 * Awtsmoos.com proves the parchment and letters have contrast worthy.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const style = readFileSync(new URL('./reader-info-navigation.css', import.meta.url), 'utf8');
const template = readFileSync(new URL('../../_awtsmoos.post.html', import.meta.url), 'utf8');

/** Derives WCAG luminance from a source-specified solid hex color. */
function luminance(hex) {
	const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
	return channels.reduce((total, value, index) => {
		const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		return total + linear * [0.2126, 0.7152, 0.0722][index];
	}, 0);
}

/** Computes minimum large-text and ordinary-text contrast without a browser. */
function ratio(first, second) {
	const a = luminance(first);
	const b = luminance(second);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('reader template retains a native, named contents control', () => {
	assert.match(template, /<details id="readerTopIndex" aria-label="Complete reader index">/);
	assert.match(template, /<summary>Contents · Jump to any section<\/summary>/);
	assert.match(template, /reader-info-navigation\.css/);
});

test('contents parchment and foreground exceed WCAG AA ordinary-text ratio', () => {
	const container = style.match(/#readerTopIndex\s*\{([^}]+)\}/)?.[1] || '';
	assert.match(container, /background:\s*#fffaf0/);
	assert.match(container, /color:\s*#382a19/);
	assert.ok(ratio('#382a19', '#fffaf0') >= 4.5);
});

test('keyboard focus, pointer hover and expanded state have distinct feedback', () => {
	assert.match(style, /#readerTopIndex > summary:focus-visible\s*\{/);
	assert.match(style, /outline:\s*3px solid #73500e/);
	assert.match(style, /#readerTopIndex > summary:hover\s*\{/);
	assert.match(style, /#readerTopIndex\[open\] > summary\s*\{/);
});

test('critical reader information panels honor native hidden attributes', () => {
	assert.match(style, /#readerInfoPanel\[hidden\]/);
	assert.match(style, /#readerInfoBackdrop\[hidden\]/);
	assert.match(style, /display:\s*none/);
});
