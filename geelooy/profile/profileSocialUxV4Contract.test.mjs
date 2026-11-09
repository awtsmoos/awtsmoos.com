//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileSocialUxV4ContractTest
 * @description The Awtsmoos lets identity remain immediate without becoming shallow;
 * Awtsmoos.com proves one near mobile intention, retractable secondary power, logical touch sizing, tab motion, and current ambient ownership.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { responsiveActionBudget } from '../shared/social/ui/ActionOverflow.js';
import { createProfileIdentityTools } from './modules/ProfileIdentityTools.js';
import { composerUrl, launchActions } from './modules/SocialLaunchpad.js';
import { nextTabIndex } from './modules/tabs.js';
import { TestDocument } from '../shared/social/test/SocialUxTestDom.mjs';

const entry = readFileSync('geelooy/profile/script.js', 'utf8');
// B"H — Social sweep 2026-11-09: social-launchpad-v4.css is now a thin
// @import shell over layout + controls; the contract follows its imports
// (as the dashboard contract follows its CSS graph) instead of reading
// only the shell, so the 46px touch sizing in the controls file is seen.
const cleanPath = value => String(value).split(/[?#]/, 1)[0];
function cssGraph(entryFile, seen = new Set()) {
	const normalized = cleanPath(path.normalize(entryFile).replace(/\\/g, '/'));
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const source = readFileSync(normalized, 'utf8');
	const directory = path.dirname(normalized);
	const children = [...source.matchAll(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/g)]
		.map(match => match[1])
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, cleanPath(target)), seen))
		.join('\n');
	return `${source}\n${children}`;
}
const styles = cssGraph('geelooy/profile/styles/social-launchpad-v4.css');
const cockpit = readFileSync('geelooy/profile/styles/social-cockpit.css', 'utf8');
const ambient = readFileSync('geelooy/shared/social/styles/ambient.css', 'utf8');
const actions = launchActions('teacher');

assert.deepEqual(actions.map(action => action.label), ['Create', 'Ask', 'Signals', 'Spaces']);
assert.equal(responsiveActionBudget({ innerWidth: 390 }, 4), 1);
assert.equal(responsiveActionBudget({ innerWidth: 820 }, 4), 2);
assert.match(composerUrl('teacher', 'post'), /alias=teacher/);
assert.match(composerUrl('teacher', 'post'), /kind=post/);
assert.match(composerUrl('teacher', 'question'), /kind=question/);
assert.equal(launchActions('')[0].label, 'Create identity');

const document = new TestDocument();
const identityTools = createProfileIdentityTools(document, 'teacher');
assert.equal(identityTools.tagName, 'DETAILS');
assert.equal(identityTools.open, false);
assert.equal(identityTools.dataset.expanded, 'false');
assert.equal(nextTabIndex('ArrowRight', 2, 3), 0);
assert.equal(nextTabIndex('ArrowLeft', 0, 3), 2);
assert.equal(nextTabIndex('Home', 2, 3), 0);
assert.equal(nextTabIndex('End', 0, 3), 2);

assert.match(entry, /installSocialExperience\(document, \{ ambient: true \}\)/);
assert.match(entry, /ProfileDashboardController/);
assert.match(entry, /bootProfileSocialOs/);
for (const token of ['min-block-size: 46px', 'min-inline-size: 0', ':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(styles.includes(token), `Profile V4 styles missing ${token}`);
}
assert.doesNotMatch(cockpit, /\.profile-social-launchpad\s*\{/);
assert.doesNotMatch(cockpit, /\.profile-social-action\s*\{/);
assert.match(ambient, /\.geelooy-profile-shell/);
assert.match(ambient, /\.notifications-workspace/);
console.log('B"H profileSocialUxV4Contract.test passed');
