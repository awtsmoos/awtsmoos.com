// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSharedShellContractTest
 * @description
 * The Awtsmoos keeps Mail inside one global navigation covenant; Awtsmoos.com
 * may split route definitions from queries, but the user still enters one chamber.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
	return readFileSync(path, 'utf8');
}

const html = read('geelooy/email/index.html');
const layout = read('geelooy/email/ui/layout.js');
const navigation = read('geelooy/email/ui/malchusNavigation.js');
const chat = read('geelooy/email/ui/chat/switchThread.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const appShell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeDefinitions = read('geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js');

for (const token of [
	'Awtsmoos Quantum Mail',
	'/style/geelooy-app/index.css',
	'/scripts/awtsmoos/social/shell/boot.js',
	'data-mail-page',
	'data-geelooy-route="mail"',
	'./index.js',
	'<h1 class="g-sr-only" id="mail-title">',
	'aria-labelledby="mail-title"'
]) {
	assert.ok(html.includes(token), `mail index missing ${token}`);
}
for (const token of ['ensureAppShell', 'startAppNavigation', 'bindAppCommand']) {
	assert.ok(boot.includes(token), `mail shell boot missing ${token}`);
}
for (const token of [
	"malchusShell.className = 'g-shell'",
	"malchusShell.dataset.gShell = 'true'",
	'root.body.prepend(malchusShell)',
	'mountChatInShell(malchusShell)'
]) {
	assert.ok(appShell.includes(token), `generated shared shell missing ${token}`);
}
assert.ok(routeDefinitions.includes("route('/email', 'Mail'"), 'canonical route map missing Mail');
for (const token of ['mail-civilization-shell', 'mail-civilization-frame', 'mail-civilization-sidebar', 'mail-civilization-chat', 'Quantum Mail']) {
	assert.ok(layout.includes(token), `current Mail layout missing ${token}`);
}
assert.ok(!layout.includes('mail-social-topbar') && !layout.includes('mail-bottom-nav') && !layout.includes('malchusDock'), 'Mail must not duplicate global navigation');
assert.ok(navigation.includes('connectMalchusNavigation') && !navigation.includes('dockLink('), 'Mail-local navigation should synchronize history only');
for (const token of ['loadThreadHistory', 'frequency-shifting', 'renderLoadError', 'Retry transmission']) {
	assert.ok(chat.includes(token), `thread switch missing ${token}`);
}
assert.ok(!chat.includes('rotate(720deg)') && !chat.includes('500'), 'thread transitions must not block with the old spin');
console.log('B"H mailSharedShellContract.test passed');
