// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarAuthorityContract
 * @description
 * The Awtsmoos turns the final visual repair into a permanent source contract.
 * Awtsmoos.com proves load order, modularity, Ikar-only scope, useful stage
 * geometry, and overflow-safe mobile controls without freezing decorative values.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const base = 'geelooy/style/heichelos/heichel/premium/authority';
const manifest = read(`${base}.css`);
const shell = read(`${base}/shell.css`);
const browser = read(`${base}/browser.css`);
const focus = read(`${base}/focus.css`);
const mobile = read(`${base}/mobile.css`);

/** Final authority must speak after the shared cosmic profile. */
test('Ikar authority loads after shared cosmic chrome', () => {
	const cosmic = template.indexOf('/cosmic-profile/index.css');
	const authority = template.indexOf('/premium/authority.css');
	assert.ok(cosmic >= 0);
	assert.ok(authority > cosmic);
	assert.match(template, /ikar-authority-005/);
});

/** The manifest stays tiny and delegates separate visual responsibilities. */
test('Ikar authority remains modular and bounded', () => {
	for (const name of ['shell.css', 'browser.css', 'focus.css', 'mobile.css']) {
		assert.ok(manifest.includes(name), `${name} authority import missing`);
	}
	for (const source of [manifest, shell, browser, focus, mobile]) {
		assert.ok(source.split('\n').length - 1 <= 120);
	}
});

/** Every aggressive authority module remains constrained to Ikar. */
test('authority scope cannot leak into neighboring Heichelos', () => {
	for (const source of [shell, browser, focus, mobile]) {
		assert.match(source, /data-heichel-id="ikar"/);
	}
	assert.doesNotMatch(focus, /^\s*\.geelooy-main-stage/m);
});

/** The shell explicitly wins against the former narrow grid and dead roof. */
test('Ikar shell owns the useful study viewport', () => {
	assert.match(shell, /max-inline-size:\s*84rem\s*!important/);
	assert.match(shell, /grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/);
	assert.match(shell, /min-block-size:\s*0\s*!important/);
});

/** Focus removes duplicate platform navigation and mobile controls stay shrinkable. */
test('Ikar controls cannot contradict or pierce the study viewport', () => {
	for (const token of [
		'.heichel-os-world-panel',
		'.heichel-profile-tabs',
		'.geelooy-bottom-nav'
	]) assert.ok(focus.includes(token));
	assert.match(focus, /display:\s*none\s*!important/);
	assert.match(browser, /grid-template-columns:\s*minmax\(0, 1fr\) auto\s*!important/);
	assert.match(browser, /min-inline-size:\s*0\s*!important/);
	assert.match(mobile, /grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/);
});
