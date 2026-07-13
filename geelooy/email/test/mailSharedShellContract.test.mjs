// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Quantum Mail shared-shell contract.
 * @description
 * The Awtsmoos names the correspondence chamber at Awtsmoos.com while one
 * global shell carries navigation and the dynamic Mail engine carries content.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/email/index.html', 'utf8');
const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
const chat = readFileSync('geelooy/email/ui/chat/switchThread.js', 'utf8');
const boot = readFileSync('geelooy/scripts/awtsmoos/social/shell/boot.js', 'utf8');
const routes = readFileSync('geelooy/scripts/awtsmoos/social/shell/appRoutes.js', 'utf8');

for (const token of [
	'Awtsmoos Quantum Mail',
	'/style/geelooy-app/index.css',
	'/scripts/awtsmoos/social/shell/boot.js',
	'data-mail-page',
	'id="goo"',
	'./index.js',
	'<h1 class="g-sr-only" id="mail-title">',
	'aria-labelledby="mail-title"'
]) {
	assert.ok(html.includes(token), `mail index missing ${token}`);
}
for (const token of ['ensureAppShell', 'startAppNavigation', 'bindAppCommand']) {
	assert.ok(boot.includes(token), `mail shell boot missing ${token}`);
}
assert.ok(routes.includes("href: '/email'"), 'canonical route map missing Mail');
for (const token of ['mail-quantum-shell', 'mail-quantum-frame', 'mail-quantum-sidebar', 'mail-quantum-chat', 'AWTSMOOS QUANTUM MAIL']) {
	assert.ok(layout.includes(token), `quantum mail layout missing ${token}`);
}
assert.ok(!layout.includes('mail-social-topbar') && !layout.includes('mail-bottom-nav'), 'Mail must not duplicate global navigation');
for (const token of ['loadThreadHistory', 'frequency-shifting', 'renderLoadError', 'Retry transmission']) {
	assert.ok(chat.includes(token), `thread switch missing ${token}`);
}
assert.ok(!chat.includes('rotate(720deg)') && !chat.includes('500'), 'thread transitions must not block with the old spin');
console.log('B"H mailSharedShellContract.test passed');
