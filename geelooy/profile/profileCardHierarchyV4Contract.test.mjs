//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileCardHierarchyV4ContractTest
 * @description The Awtsmoos lets one identity card contain many roads without becoming a toolbar;
 * Awtsmoos.com proves one direct doorway remains visible while secondary powers stay complete, bounded, tactile, and closed by default.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { aliasCard, heichelCard } from './modules/cards.js';
import { TestDocument, flatten } from '../shared/social/test/SocialUxTestDom.mjs';

const documentValue = new TestDocument();
globalThis.document = documentValue;

function byClass(root, className) {
	return flatten(root).filter(element => String(element.className || '').split(/\s+/).includes(className));
}

function byTag(root, tagName) {
	return flatten(root).filter(element => element.tagName === tagName.toUpperCase());
}

const alias = aliasCard({ id: 'teacher', name: 'Teacher', description: 'Teaching identity', default: false });
assert.equal(byClass(alias, 'profileCardAction--primary').length, 1);
assert.equal(byClass(alias, 'profileCardTools').length, 1);
const aliasDisclosure = byClass(alias, 'profileCardTools')[0];
assert.equal(aliasDisclosure.tagName, 'DETAILS');
assert.equal(aliasDisclosure.open, false);
assert.equal(aliasDisclosure.dataset.expanded, 'false');
assert.equal(byTag(aliasDisclosure, 'A').length, 4);
const defaultButtons = flatten(aliasDisclosure).filter(element => element.dataset?.defaultAlias === 'teacher');
assert.equal(defaultButtons.length, 1);
assert.equal(defaultButtons[0].tagName, 'BUTTON');
assert.equal(defaultButtons[0].attributes['aria-pressed'], 'false');

const space = heichelCard({ id: 'study', name: 'Study', description: 'Knowledge Space' }, 'teacher');
assert.equal(byClass(space, 'profileCardAction--primary').length, 1);
assert.equal(byClass(space, 'profileCardTools').length, 1);
const spaceDisclosure = byClass(space, 'profileCardTools')[0];
assert.equal(spaceDisclosure.open, false);
assert.equal(byTag(spaceDisclosure, 'A').length, 2);
assert.match(byClass(space, 'profileCardAction--primary')[0].href, /\/heichelos\/study/);

const source = readFileSync('geelooy/profile/modules/cards.js', 'utf8');
// B"H — Social sweep 2026-11-09: profile-cards-v4.css is a thin @import
// shell over the card shells + actions files (where the 46px touch sizing
// lives); the contract follows its imports instead of reading only the shell.
const cleanPath = value => String(value).split(/[?#]/, 1)[0];
function cssGraph(entry, seen = new Set()) {
	const normalized = cleanPath(path.normalize(entry).replace(/\\/g, '/'));
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const src = readFileSync(normalized, 'utf8');
	const directory = path.dirname(normalized);
	const children = [...src.matchAll(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/g)]
		.map(match => match[1])
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, cleanPath(target)), seen))
		.join('\n');
	return `${src}\n${children}`;
}
const css = cssGraph('geelooy/profile/styles/profile-cards-v4.css');
assert.doesNotMatch(source, /innerHTML/);
for (const token of ['min-block-size: 46px', 'min-inline-size: 0', ':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(css.includes(token), `Profile card styles missing ${token}`);
}
console.log('B"H profileCardHierarchyV4Contract.test passed');
