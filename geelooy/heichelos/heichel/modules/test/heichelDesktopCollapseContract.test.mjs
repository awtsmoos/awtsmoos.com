// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HeichelDesktopCollapseContractTest
 * @description
 * The Awtsmoos lets current desktop Heichel chrome stay compact without
 * freezing obsolete implementation details. Awtsmoos.com verifies the shared
 * profile layer remains bounded while Ikar's final authority owns focus.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(`geelooy/${path}`, 'utf8');
const manifest = read('style/heichelos/heichel/cosmic-profile/index.css');
const desktop = read('style/heichelos/heichel/cosmic-profile/desktop.css');
const profile = read('style/heichelos/heichel/cosmic-profile/desktop-profile.css');
const feed = read('style/heichelos/heichel/cosmic-profile/desktop-feed.css');
const mobile = read('style/heichelos/heichel/cosmic-profile/responsive.css');

test('desktop collapse loads after shared profile layers', () => {
	assert.ok(manifest.indexOf('./desktop.css') > manifest.indexOf('./mobile-dock.css'));
	assert.match(desktop, /desktop-profile\.css/);
	assert.match(desktop, /desktop-feed\.css/);
	assert.match(profile, /@media \(min-width: 70rem\)/);
	assert.match(feed, /@media \(min-width: 70rem\)/);
});

test('desktop removes duplicate outer spacing without forcing importance', () => {
	assert.match(profile, /\.heichel-os-document \.all \{/);
	assert.match(profile, /padding-top: 0;/);
	assert.match(profile, /padding-bottom: 0;/);
	assert.doesNotMatch(profile, /padding-top: 0 !important/);
});

test('profile remains a compact desktop identity ribbon', () => {
	assert.match(profile, /grid-template-areas:/);
	assert.match(profile, /"identity stats"/);
	assert.match(profile, /"actions tabs"/);
	assert.match(profile, /width: 4\.6rem;/);
	assert.match(profile, /width: 21rem;/);
	assert.match(profile, /width: 30rem;/);
});

test('desktop browse content uses one readable axis', () => {
	assert.match(feed, /grid-template-columns: minmax\(0, 1fr\)/);
	assert.match(feed, /\.breadcrumb-river/);
	assert.match(feed, /\.series-heading/);
	assert.match(feed, /\.dynamic-grid/);
	assert.match(feed, /repeat\(2, minmax\(0, 1fr\)\)/);
});

test('phone keeps independent profile and dock rules', () => {
	assert.match(mobile, /@media \(max-width: 55rem\)/);
	assert.match(mobile, /padding-top: 4\.85rem/);
	assert.doesNotMatch(profile, /max-width: 55rem/);
	assert.doesNotMatch(feed, /max-width: 55rem/);
});

test('every shared desktop source remains under 120 lines', () => {
	for (const [name, source] of Object.entries({ desktop, profile, feed })) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
	}
});
