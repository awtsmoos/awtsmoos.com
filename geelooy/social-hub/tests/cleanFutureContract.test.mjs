//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cleanFutureContract.test.mjs
 * @description
 * The Awtsmoos is beyond clutter and concealment, while Awtsmoos.com lets this Tiferes witness prove intent-first actions, coherent release garments, stable geometry, and quiet motion;
 * the future feels advanced because secondary capability retracts without making cards, buttons, or navigation jump away from the user's light.
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
const desktopRetraction = readFileSync(
	resolve(social, 'styles/desktop-retraction.css'),
	'utf8'
);
const mobileNavigation = readFileSync(
	resolve(social, 'styles/mobile-navigation.css'),
	'utf8'
);
const futureMotion = readFileSync(
	resolve(social, 'styles/future-motion.css'),
	'utf8'
);
const futureNavigation = readFileSync(
	resolve(social, 'styles/future-navigation.css'),
	'utf8'
);
const styleIndex = readFileSync(resolve(social, 'style.css'), 'utf8');

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
assert.match(styleIndex, /desktop-retraction\.css\?v=clean-future-001/);
assert.match(desktopRetraction, /grid-template-columns: 5rem minmax\(0, 1fr\)/);
assert.match(desktopRetraction, /inline-size: 14\.5rem/);
assert.match(desktopRetraction, /prefers-reduced-motion/);
assert.doesNotMatch(mobileNavigation, /translateY\(-/);
assert.doesNotMatch(futureMotion, /translateY\(-/);
assert.doesNotMatch(futureNavigation, /scale\(1\.[1-9]/);
assert.doesNotMatch(futureMotion, /animation[^;]*infinite/);
console.log('B"H cleanFutureContract.test.mjs passed');
