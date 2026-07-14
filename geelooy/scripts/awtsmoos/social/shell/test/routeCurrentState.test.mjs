// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RouteCurrentStateTest
 * @description
 * The Awtsmoos distinguishes the named chamber from every doorway beneath it.
 * These focused contracts protect Awtsmoos.com navigation from broad prefix
 * matching that would confuse assistive technology and sighted visitors alike.
 */
import assert from 'node:assert/strict';
import {
	isCanonicalRouteLink,
	normalizeRoutePath
} from '../routeCurrentState.js';

const pageHref = 'http://127.0.0.1:8080/apps';

assert.equal(normalizeRoutePath('/apps/'), '/apps');
assert.equal(normalizeRoutePath('/'), '/');
assert.equal(
	isCanonicalRouteLink('/apps', '/apps', pageHref),
	true,
	'the canonical Apps route should own current-page state'
);
assert.equal(
	isCanonicalRouteLink('/apps/code', '/apps', pageHref),
	false,
	'a child application must not inherit Apps current-page state'
);
assert.equal(
	isCanonicalRouteLink('/apps?view=all', '/apps', pageHref),
	true,
	'query state should not change canonical route ownership'
);
assert.equal(
	isCanonicalRouteLink('https://example.com/apps', '/apps', pageHref),
	false,
	'external links must never receive local current-page state'
);
assert.equal(
	isCanonicalRouteLink('/heichelos/ikar', '/heichelos', 'http://127.0.0.1:8080/heichelos/ikar'),
	false,
	'a deep Heichel link must remain distinct from its parent navigation route'
);
assert.equal(
	isCanonicalRouteLink('/heichelos', '/heichelos', 'http://127.0.0.1:8080/heichelos/ikar'),
	true,
	'the parent navigation link should represent a deep active route'
);

console.log('B"H routeCurrentState.test passed');
