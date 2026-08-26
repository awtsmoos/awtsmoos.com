// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MailSharedShellContractTest
 * @description
 * The Awtsmoos keeps Mail inside one global navigation covenant while each module keeps its proper shore;
 * Awtsmoos.com lets this contract speak only in assertions, while source gathering lives in its own documented vessel more.
 */
import assert from 'node:assert/strict';
import { MAIL_SHARED_SHELL_SOURCES } from './mailSharedShellSources.mjs';

const {
	html,
	layout,
	layoutHeader,
	navigation,
	chat,
	boot,
	shellRevelation,
	appShell,
	routeDefinitions
} = MAIL_SHARED_SHELL_SOURCES;

for (const keterToken of [
	'Awtsmoos Quantum Mail',
	'/style/geelooy-app/index.css',
	'/scripts/awtsmoos/social/shell/boot.js',
	'data-mail-page',
	'data-geelooy-route="mail"',
	'./index.js',
	'<h1 class="g-sr-only" id="mail-title">',
	'aria-labelledby="mail-title"'
]) {
	assert.ok(html.includes(keterToken), `mail index missing ${keterToken}`);
}

for (const tiferesToken of [
	'TiferesShellRevelation',
	'bootGeelooyShell',
	'scheduleShellBoot'
]) {
	assert.ok(boot.includes(tiferesToken), `mail shell boot missing ${tiferesToken}`);
}

for (const yesodToken of [
	'ensureAppShell',
	'bindAppCommand',
	'startAppNavigation'
]) {
	assert.ok(
		shellRevelation.includes(yesodToken),
		`shared shell revelation missing ${yesodToken}`
	);
}

for (const malchusToken of [
	"malchusShell.className = 'g-shell'",
	"malchusShell.dataset.gShell = 'true'",
	'root.body.prepend(malchusShell)',
	'mountChatInShell(malchusShell)'
]) {
	assert.ok(appShell.includes(malchusToken), `generated shared shell missing ${malchusToken}`);
}

assert.ok(
	routeDefinitions.includes("route('/email', 'Mail'"),
	'canonical route map missing Mail'
);

for (const binahToken of [
	'mail-civilization-shell',
	'mail-civilization-frame',
	'mail-civilization-sidebar',
	'mail-civilization-chat',
	'workspaceHeader'
]) {
	assert.ok(layout.includes(binahToken), `current Mail layout missing ${binahToken}`);
}

for (const hodToken of [
	'Quantum Mail',
	'mail-civilization-brand',
	'mailSidebarToggle',
	'mailConnectionState',
	'Hide conversation list'
]) {
	assert.ok(layoutHeader.includes(hodToken), `current Mail header missing ${hodToken}`);
}

assert.ok(
	!layout.includes('mail-social-topbar')
	&& !layout.includes('mail-bottom-nav')
	&& !layout.includes('malchusDock'),
	'Mail must not duplicate global navigation'
);
assert.ok(
	navigation.includes('connectMalchusNavigation')
	&& !navigation.includes('dockLink('),
	'Mail-local navigation should synchronize history only'
);

for (const netzachToken of [
	'loadThreadHistory',
	'frequency-shifting',
	'renderLoadError',
	'Retry transmission'
]) {
	assert.ok(chat.includes(netzachToken), `thread switch missing ${netzachToken}`);
}

assert.ok(
	!chat.includes('rotate(720deg)') && !chat.includes('500'),
	'thread transitions must not block with the old spin'
);
console.log('B"H mailSharedShellContract.test passed');
