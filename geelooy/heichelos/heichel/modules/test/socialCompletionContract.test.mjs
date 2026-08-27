//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialCompletionContractTest
 * @description The Awtsmoos lets each social surface evolve without vanishing from the larger civilization;
 * Awtsmoos.com verifies current Notifications, shared-shell Mail, and editor-first creation instead of retired chrome or theme tokens.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const files = {
	notificationsHtml: read('geelooy/notifications/index.html'),
	notificationsApp: read('geelooy/notifications/app.js'),
	notificationsApi: read('geelooy/notifications/modules/api.js'),
	notificationsHelpers: read('geelooy/notifications/modules/helpers.js'),
	notificationsController: read('geelooy/notifications/modules/controller.js'),
	mailHtml: read('geelooy/email/index.html'),
	mailLayout: read('geelooy/email/ui/layout.js'),
	submitHtml: read('geelooy/heichelos/heichel/submit/_awtsmoos.post.html'),
	submitCss: read('geelooy/heichelos/heichel/submit/style.css')
};

for (const token of [
	'notifications-workspace', 'signal-category-tabs', 'data-signal-type',
	'notifications-list', 'signalAdvancedFilters', 'id="markAll"', './app.js'
]) {
	assert.ok(files.notificationsHtml.includes(token), `notifications html missing ${token}`);
}
assert.match(files.notificationsHtml, /<details[^>]+notifications-filter-panel/, 'advanced notification filters must remain retractable');
assert.match(files.notificationsApp, /bootNotifications/, 'notifications app must boot controller');
for (const token of [
	"notificationApi('/alias/default')", '/notifications/${encodeURIComponent(aliasId)}?',
	'/read`, { method: \'POST\' }', '/read/all`, { method: \'POST\' }'
]) {
	assert.ok(files.notificationsApi.includes(token), `notifications API missing ${token}`);
}
assert.match(files.notificationsHelpers, /getDefaultAliasId/, 'notification helpers must resolve default alias through API');
assert.match(files.notificationsHelpers, /hydrateDefaultAlias/, 'notification helpers must expose alias hydration');
for (const token of ['hydrateDefaultAlias', 'getNotifications', 'markNotificationRead', 'markAllNotificationsRead']) {
	assert.ok(files.notificationsController.includes(token), `notifications controller missing ${token}`);
}

for (const token of [
	'mail-civilization-shell', 'mail-civilization-frame', 'mail-civilization-sidebar',
	'mail-civilization-chat', 'Mail communication workspace', 'connectMalchusNavigation'
]) {
	assert.ok(files.mailLayout.includes(token), `mail layout missing ${token}`);
}
for (const token of ['geelooy-mail-document', 'geelooy-page-root', '/scripts/awtsmoos/social/shell/boot.js']) {
	assert.ok(files.mailHtml.includes(token), `mail html missing ${token}`);
}
for (const retired of ['mail-social-topbar', 'mail-bottom-nav', 'malchusDock']) {
	assert.equal(files.mailLayout.includes(retired), false, `mail layout must not duplicate shared navigation with ${retired}`);
}

for (const token of ['submit-shell', 'post-creator-container', 'page-title-glow', 'composer-card']) {
	assert.ok(files.submitHtml.includes(token), `create html missing ${token}`);
}
for (const token of [
	'--create-accent', '.post-creator-container', '.page-title-glow', '.publish-button',
	'.simple-advanced-drawer', '.mobile-create-nav', '@media (prefers-reduced-motion: reduce)'
]) {
	assert.ok(files.submitCss.includes(token), `create css missing ${token}`);
}
console.log('B"H socialCompletionContract.test passed');
