// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahReaderAuthorityContract
 * @description
 * The Awtsmoos protects reading-first geometry from historical cushions and
 * physical-position rules. Awtsmoos.com verifies the final manifest, modular
 * files, bottom-right controls, and clear reader labels as permanent contracts.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const root = 'geelooy/heichelos/post/styles/reader-controls';
const template = read('geelooy/heichelos/post/_awtsmoos.post.html');
const manifest = read(`${root}/torah-authority.css`);
const surface = read(`${root}/torah-authority/surface.css`);
const sections = read(`${root}/torah-authority/sections.css`);
const controls = read(`${root}/torah-authority/controls.css`);

test('Torah reader authority owns the final cascade', () => {
	assert.ok(template.indexOf('torah-authority.css') > template.indexOf('mobile-reading.css'));
	assert.match(template, /reader-final-005/);
});

test('Torah reader authority remains modular and bounded', () => {
	for (const name of ['surface.css', 'sections.css', 'controls.css']) {
		assert.ok(manifest.includes(name), `${name} import missing`);
	}
	for (const source of [manifest, surface, sections, controls]) {
		assert.ok(source.split('\n').length - 1 <= 120);
	}
});

test('Torah text begins without the historical giant entry cushion', () => {
	assert.match(surface, /margin-block-start:\s*0\s*!important/);
	assert.match(surface, /padding-block-start:\s*\.8rem\s*!important/);
	assert.doesNotMatch(surface, /9rem|17rem|24vh/);
});

test('reader tools remain understandable and bottom anchored', () => {
	for (const token of [
		'top: auto !important',
		'left: auto !important',
		'right: max(.8rem',
		'bottom: max(.8rem',
		'white-space: nowrap !important'
	]) assert.ok(controls.includes(token), `control authority missing ${token}`);
	assert.match(template, />Aa<\/button>/);
	assert.match(template, />Sources<\/button>/);
});

test('reader section hierarchy stays quiet rather than card-heavy', () => {
	assert.match(sections, /background:\s*transparent\s*!important/);
	assert.match(sections, /box-shadow:\s*none\s*!important/);
	assert.match(sections, /line-height:\s*1\.78\s*!important/);
});
