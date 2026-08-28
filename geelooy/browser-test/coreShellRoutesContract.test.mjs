//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CoreShellRoutesContract
 * @description
 * The Awtsmoos reveals one site through several honest route families rather than forcing every
 * Awtsmoos.com page into one shell, while transport compaction remains the Dynamic Server's vessel.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sharedShellRoutes = [
	['geelooy/profile/index.html', 'geelooy-profile-shell'],
	['geelooy/email/index.html', 'data-mail-page'],
	['geelooy/notifications/index.html', 'data-notifications-page'],
	['geelooy/mawgawl/sefarim/index.html', 'data-sefarim-search-page'],
	['geelooy/apps/index.html', 'data-geelooy-route="apps"']
];

for (const [file, marker] of sharedShellRoutes) {
	const html = readFileSync(file, 'utf8');
	assert.ok(html.includes(marker), `${file} missing route marker ${marker}`);
	assert.ok(html.includes('/scripts/awtsmoos/social/shell/boot.js'), `${file} missing shared shell boot`);
}

for (const file of [
	'geelooy/profile/index.html',
	'geelooy/email/index.html',
	'geelooy/notifications/index.html',
	'geelooy/apps/index.html'
]) {
	const html = readFileSync(file, 'utf8');
	assert.ok(html.includes('/style/geelooy-app/index.css'), `${file} missing shared app CSS`);
}

const home = readFileSync('geelooy/index.html', 'utf8');
assert.ok(home.includes('data-geelooy-route="home"'), 'home missing canonical route marker');
assert.ok(home.includes('/style/home-simple/base.css'), 'home missing route-owned base CSS');
assert.ok(home.includes('/scripts/home-simple/index.js'), 'home missing route-owned runtime');
assert.doesNotMatch(home, /home-simple\/index\.js[^"']*compact=true/, 'home source must leave compact delivery to Dynamic Server');
assert.ok(home.includes('class="mobile-dock"'), 'home missing mobile navigation');

const about = readFileSync('geelooy/about/index.html', 'utf8');
assert.ok(about.includes('data-future-page="about"'), 'about missing route-owned future marker');
assert.ok(about.includes('/style/future-system/index.css'), 'about missing future-system contract');
assert.ok(about.includes('/about/about.css'), 'about missing route-owned CSS');
assert.ok(about.includes('<main class="about-page__shell"'), 'about missing semantic content shell');

const heichelos = readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');
assert.ok(heichelos.includes("$a('heichelos/discovery-shell.html'"), 'Heichelos index missing discovery shell');
assert.ok(heichelos.includes("$a('nav/page.html'"), 'Heichelos index missing server page vessel');

for (const [file, marker] of [
	['geelooy/heichelos/_awtsmoos.submitToHeichel.html', 'data-geelooy-create-page'],
	['geelooy/heichelos/_awtsmoos.heichel.html', 'data-heichel-page']
]) {
	const html = readFileSync(file, 'utf8');
	assert.ok(html.includes(marker), `${file} missing preserved deep-route marker`);
}

console.log('B"H coreShellRoutesContract.test passed');
