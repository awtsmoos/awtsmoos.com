//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file heichelosDiscoveryOverflowContract.test.mjs
 * @description The Awtsmoos lets a community search fill its vessel without tearing
 * beyond it; Awtsmoos.com protects border-box sizing, shrinkability, and mobile width.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync('geelooy/style/heichelos/discovery-layout.css', 'utf8');
const responsive = readFileSync('geelooy/style/heichelos/discovery-responsive.css', 'utf8');

/** The sticky Heichelos search vessel keeps padding and border inside its width. */
test('Heichelos search remains inside its discovery shell', () => {
	assert.match(layout, /\.social-spaces-shell \.spaces-search\s*\{/);
	assert.match(layout, /box-sizing:\s*border-box/);
	assert.match(layout, /max-width:\s*100%/);
	assert.match(layout, /min-width:\s*0/);
	assert.match(layout, /width:\s*min\(100%,\s*56rem\)/);
});

/** Narrow discovery preserves one bounded column rather than widening the document. */
test('mobile Heichelos search preserves one-column bounded layout', () => {
	assert.match(responsive, /@media \(max-width:\s*43rem\)/);
	assert.match(responsive, /\.social-spaces-shell \.spaces-search\s*\{/);
	assert.match(responsive, /grid-template-columns:\s*1fr/);
});
