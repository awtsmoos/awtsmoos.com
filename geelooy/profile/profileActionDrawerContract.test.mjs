// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActionDrawerContractTest
 * @description
 * The Awtsmoos guards a visible, recoverable Awtsmoos.com quick-action sheet
 * while the Profile's old oversized stylesheet remains split into small vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const page = read('geelooy/profile/index.html');
const manifest = read('geelooy/style/civilization/profile-content.css');
const drawerCss = read('geelooy/style/civilization/profile-action-drawer.css');
const inlineActions = read('geelooy/profile/modules/inlineActions.js');
const aliases = read('geelooy/profile/modules/profile-actions/aliases.js');
const content = read('geelooy/profile/modules/profile-actions/content.js');
const shared = read('geelooy/profile/modules/profile-actions/shared.js');
const modules = [
	manifest,
	drawerCss,
	inlineActions,
	aliases,
	content,
	shared,
	read('geelooy/style/civilization/profile-content/surfaces.css'),
	read('geelooy/style/civilization/profile-content/stats.css'),
	read('geelooy/style/civilization/profile-content/tabs.css'),
	read('geelooy/style/civilization/profile-content/living.css'),
	read('geelooy/style/civilization/profile-content/responsive.css')
];

assert.match(page, /profile-content\.css/);
assert.match(manifest, /profile-content\/surfaces\.css/);
assert.match(manifest, /profile-content\/responsive\.css/);
assert.match(manifest, /profile-action-drawer\.css/);
assert.ok(
	manifest.indexOf('profile-action-drawer.css') > manifest.indexOf('profile-content/responsive.css'),
	'drawer override must load last'
);

assert.match(drawerCss, /\.profile-action-drawer:not\(\[hidden\]\)/);
assert.match(drawerCss, /position:\s*fixed;/);
assert.match(drawerCss, /env\(safe-area-inset-bottom\)/);
assert.match(drawerCss, /max-block-size:\s*min\(72dvh, 38rem\)/);
assert.match(drawerCss, /min-block-size:\s*44px;/);
assert.match(drawerCss, /:focus-visible/);

assert.match(inlineActions, /event\.key !== 'Escape'/);
assert.match(inlineActions, /aria-expanded/);
assert.match(inlineActions, /panel\.setAttribute\('role', 'region'\)/);
assert.match(inlineActions, /panel\.setAttribute\('aria-label', title\)/);
assert.match(inlineActions, /opener\?\.focus\(\{ preventScroll: true \}\)/);
assert.match(inlineActions, /actionStatus\('Loading…', 'loading'\)/);

assert.doesNotMatch(aliases, /catch\s*\{\s*\}/);
assert.doesNotMatch(content, /catch\s*\{\s*\}/);
assert.match(aliases, /Could not load aliases/);
assert.match(content, /Open full inbox/);
assert.match(content, /Open full notifications/);

for (const source of modules) {
	assert.ok(source.split('\n').length <= 120, 'Profile action module exceeds 120 lines');
}

console.log('B"H profileActionDrawerContract.test passed');
