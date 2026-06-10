// B"H
/**
 * Chapter 28: all visible mockup pages have social vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = {
  notificationsHtml: readFileSync('geelooy/notifications/index.html', 'utf8'),
  notificationsJs: readFileSync('geelooy/notifications/script.js', 'utf8'),
  notificationsCss: readFileSync('geelooy/style/social/notifications.css', 'utf8'),
  mailHtml: readFileSync('geelooy/email/index.html', 'utf8'),
  mailLayout: readFileSync('geelooy/email/ui/layout.js', 'utf8'),
  mailCss: readFileSync('geelooy/email/css/social-shell.css', 'utf8'),
  submitCss: readFileSync('geelooy/heichelos/heichel/submit/style.css', 'utf8')
};

for (const token of ['notifications-shell', 'notification-tabs', 'data-notification-list', '/notifications/script.js']) {
  assert.ok(files.notificationsHtml.includes(token), `notifications html missing ${token}`);
}
for (const token of ['/api/social/alias/default', '/api/social/alias/${encodeURIComponent(alias)}/notifications', 'data-mark-all']) {
  assert.ok(files.notificationsJs.includes(token), `notifications js missing ${token}`);
}
for (const token of ['mail-social-shell', 'mail-social-topbar', 'mail-bottom-nav']) {
  assert.ok(files.mailLayout.includes(token) || files.mailCss.includes(token), `mail missing ${token}`);
}
assert.ok(files.mailHtml.includes('./css/social-shell.css'), 'mail html must include social shell css');
for (const token of ['--submit-gold', '.post-creator-container', '.page-title-glow', '.btn.action-btn']) {
  assert.ok(files.submitCss.includes(token), `submit css missing ${token}`);
}
console.log('B"H socialCompletionContract.test passed');
