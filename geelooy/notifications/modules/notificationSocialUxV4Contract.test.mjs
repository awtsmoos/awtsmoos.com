//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationSocialUxV4ContractTest
 * @description The Awtsmoos lets one truthful destination shine while secondary state remains close but quiet;
 * Awtsmoos.com proves guarded links, retractable read work, logical touch sizing, viewport-bounded mobile sheets, shared ambience, and motion restraint.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
	createNotificationActions,
	safeActionLink
} from './NotificationActions.js';
import { TestDocument, flatten } from '../../shared/social/test/SocialUxTestDom.mjs';

const documentValue = new TestDocument();
globalThis.document = documentValue;
globalThis.location = {
	href: 'https://awtsmoos.com/notifications/',
	origin: 'https://awtsmoos.com'
};

function byTag(root, tagName) {
	return flatten(root).filter(element => element.tagName === tagName.toUpperCase());
}

function markedButtons(root) {
	return flatten(root).filter(element => Boolean(element.dataset?.markRead));
}

const direct = safeActionLink('/comment-thread/?id=c1', 'comment');
assert.equal(direct.tagName, 'A');
assert.equal(direct.href, '/comment-thread/?id=c1');
assert.equal(direct.textContent, 'Open conversation');
assert.equal(safeActionLink('https://example.com/trap', 'comment'), null);

const unreadLinked = createNotificationActions({ id: 'n1', actionUrl: '/comment-thread/?id=c1' }, 'comment', true);
assert.equal(byTag(unreadLinked, 'A').length, 1);
assert.equal(byTag(unreadLinked, 'DETAILS').length, 1);
assert.equal(byTag(unreadLinked, 'DETAILS')[0].open, false);
assert.equal(byTag(unreadLinked, 'DETAILS')[0].dataset.expanded, 'false');
assert.equal(markedButtons(unreadLinked).length, 1);
assert.equal(markedButtons(unreadLinked)[0].dataset.markRead, 'n1');

const unreadNoLink = createNotificationActions({ id: 'n2' }, 'system', true);
assert.equal(byTag(unreadNoLink, 'A').length, 0);
assert.equal(byTag(unreadNoLink, 'DETAILS').length, 0);
assert.equal(markedButtons(unreadNoLink).length, 1);
const readNoLink = createNotificationActions({ id: 'n3' }, 'system', false);
assert.equal(flatten(readNoLink).length, 1);

const app = readFileSync('geelooy/notifications/app.js', 'utf8');
const categories = readFileSync('geelooy/notifications/modules/categoryTabs.js', 'utf8');
const css = readFileSync('geelooy/notifications/styles/signal-actions-v4.css', 'utf8');
const ambient = readFileSync('geelooy/shared/social/styles/ambient.css', 'utf8');
assert.match(app, /installSocialExperience\(document, \{ ambient: true \}\)/);
assert.doesNotMatch(categories, /matchMedia|advanced\.open\s*=\s*true/);
assert.match(categories, /form\.requestSubmit\(\)/);
for (const token of [
	'min-block-size: 44px',
	'position: fixed',
	'safe-area-inset-left',
	'max-inline-size: calc(100vw - 1.3rem)',
	'overflow: auto',
	'overscroll-behavior: contain',
	':hover',
	':active',
	':focus-visible',
	'prefers-reduced-motion'
]) {
	assert.ok(css.includes(token), `Notifications V5 styles missing ${token}`);
}
assert.match(css, /@media \(max-width:\s*38\.75rem\)/);
assert.match(ambient, /\.notifications-workspace/);
assert.ok(css.split('\n').length <= 120, 'notification V5 action styles exceed 120 lines');
console.log('B"H notificationSocialUxV4Contract.test passed');
