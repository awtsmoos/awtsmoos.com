//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cleanFutureContract.test.mjs
 * @description
 * The Awtsmoos lets each cache boundary keep its own honest garment while interaction remains calm and bright;
 * Awtsmoos.com proves feed priority, Hub-local release coherence, stable geometry, and restrained motion in one light.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ACTION_PRIORITY,
	prioritizedActions
} from '../js/ui/feed/FeedUniversalActions.js';
import { RELEASE as FEED_RELEASE } from '../js/ui/feed/FeedStyleSheet.js';

const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const source = relativePath => readFileSync(resolve(social, relativePath), 'utf8');
const desktopRetraction = source('styles/desktop-retraction.css');
const mobileNavigation = source('styles/mobile-navigation.css');
const futureMotion = source('styles/future-motion.css');
const futureNavigation = source('styles/future-navigation.css');
const styleIndex = source('style.css');

/** @returns {string} Canonical Hub-local release discovered from the manifest itself. */
function hubLocalRelease() {
	const yesodMatch = styleIndex.match(/desktop-retraction\.css\?v=(hub-local-\d+)/);
	assert.ok(yesodMatch, 'desktop retraction must remain in the Hub-local manifest');
	return yesodMatch[1];
}

assert.deepEqual(ACTION_PRIORITY, [
	'answer',
	'reply',
	'open',
	'addToHeichel',
	'share',
	'copy'
]);
const unordered = [
	{ id: 'share' },
	{ id: 'copy' },
	{ id: 'open' },
	{ id: 'addToHeichel' }
];
assert.deepEqual(
	prioritizedActions(unordered).map(action => action.id),
	['open', 'addToHeichel', 'share', 'copy']
);
assert.equal(FEED_RELEASE, 'clean-future-001');
assert.match(hubLocalRelease(), /^hub-local-\d+$/);
assert.match(desktopRetraction, /grid-template-columns: 5rem minmax\(0, 1fr\)/);
assert.match(desktopRetraction, /inline-size: 14\.5rem/);
assert.match(desktopRetraction, /prefers-reduced-motion/);
assert.doesNotMatch(mobileNavigation, /translateY\(-/);
assert.doesNotMatch(futureMotion, /translateY\(-/);
assert.doesNotMatch(futureNavigation, /scale\(1\.[1-9]/);
assert.doesNotMatch(futureMotion, /animation[^;]*infinite/);

console.log('B"H cleanFutureContract.test.mjs passed');
