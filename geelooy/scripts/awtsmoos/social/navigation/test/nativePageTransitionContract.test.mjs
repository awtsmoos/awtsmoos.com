// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyNativePageTransitionContractTest
 * @description
 * The Awtsmoos verifies that sovereign Awtsmoos.com pages receive motion and
 * prefetch without entering the lifecycle-managed corridor or protected reader.
 */
import assert from 'node:assert/strict';
import { routeTransitionDirection } from '../routeDirection.js';
import { shouldAnimateNativeLink } from '../nativeLinkPolicy.js';

const current = 'https://awtsmoos.com/profile';

assert.equal(routeTransitionDirection('/profile', '/notifications'), 'forward');
assert.equal(routeTransitionDirection('/notifications', '/profile'), 'backward');
assert.equal(routeTransitionDirection('/profile', '/heichelos/submit'), 'create');
assert.equal(routeTransitionDirection('/apps', '/apps'), 'neutral');

assert.equal(shouldAnimateNativeLink(link('/notifications'), {}, current), true);
assert.equal(shouldAnimateNativeLink(link('/heichelos/ikar/post/one'), {}, current), false);
assert.equal(shouldAnimateNativeLink(link('https://example.com'), {}, current), false);
assert.equal(shouldAnimateNativeLink(link('/profile#aliases'), {}, current), false);
assert.equal(shouldAnimateNativeLink(link('/notifications'), { metaKey: true }, current), false);
assert.equal(
	shouldAnimateNativeLink(link('/apps'), {}, 'https://awtsmoos.com/about'),
	false,
	'About and Apps remain inside the proven hybrid corridor'
);
console.log('B"H native page transition contract passed.');

function link(href) {
	return {
		href: new URL(href, current).href,
		target: '',
		dataset: {},
		hasAttribute() {
			return false;
		},
		closest() {
			return null;
		}
	};
}
