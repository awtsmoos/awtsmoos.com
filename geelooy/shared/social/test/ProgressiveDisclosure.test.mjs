//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProgressiveDisclosureTest
 * @description The Awtsmoos lets advanced depth remain present without appearing before it is invited;
 * Awtsmoos.com proves the shared vessel is native, closed by default, labeled, stateful, and still able to begin intentionally open.
 */
import assert from 'node:assert/strict';
import { createProgressiveDisclosure } from '../ui/ProgressiveDisclosure.js';
import { TestDocument, TestElement } from './SocialUxTestDom.mjs';

const document = new TestDocument();
const content = new TestElement('input');
let lastToggle = null;
const disclosure = createProgressiveDisclosure({
	document,
	label: 'Advanced',
	detail: 'voice · media',
	content,
	onToggle: open => { lastToggle = open; }
});

assert.equal(disclosure.root.tagName, 'DETAILS');
assert.equal(disclosure.root.open, false);
assert.equal(disclosure.root.dataset.expanded, 'false');
assert.equal(disclosure.summary.tagName, 'SUMMARY');
assert.equal(disclosure.detail.textContent, 'voice · media');
assert.equal(disclosure.body.children[0], content);

disclosure.root.open = true;
disclosure.root.dispatch('toggle');
assert.equal(disclosure.root.dataset.expanded, 'true');
assert.equal(lastToggle, true);

const openDisclosure = createProgressiveDisclosure({ document, label: 'Context', open: true });
assert.equal(openDisclosure.root.open, true);
assert.equal(openDisclosure.root.dataset.expanded, 'true');
console.log('B"H ProgressiveDisclosure.test passed');
