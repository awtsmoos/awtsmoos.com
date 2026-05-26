// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';

const panel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platformPanel.js', 'utf8');
const notificationsPanel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/notificationsPanel.js', 'utf8');
const api = fs.readFileSync('geelooy/heichelos/heichel/modules/api.js', 'utf8');
const ops = fs.readFileSync('geelooy/heichelos/heichel/modules/api/platformOps.js', 'utf8');
const desktopCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/platform-panels.css', 'utf8');
const mobileCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/platform-mobile.css', 'utf8');
const notificationCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications.css', 'utf8');
const notificationMobileCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications-mobile.css', 'utf8');
const revamped = fs.readFileSync('geelooy/style/heichelos/heichel.revamped.css', 'utf8');

const renderedActions = [...panel.matchAll(/data-platform-action="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(renderedActions, [...new Set(renderedActions)], 'platformPanel renders duplicate actions');
assert.deepEqual(renderedActions.sort(), ['db', 'feed', 'ops', 'presence', 'sync']);
assert.match(notificationsPanel, /aria-expanded/, 'notifications toggle must expose expanded state');
assert.match(notificationsPanel, /setInterval/, 'notifications panel must poll for live updates');
assert.match(notificationsPanel, /markNotificationRead/, 'notifications panel must expose mark-read flow');

const exportCount = (api.match(/platformOps\.js/g) || []).length;
assert.equal(exportCount, 1, 'api.js must export platformOps exactly once');

for (const token of [
  'moderationQueues',
  'moderationReport',
  'moderationAction',
  'moderationEscalate',
  'migrationDryRun',
  'migrationRun',
  'federationImport',
  'mediaRegister',
  'mediaAttach',
  'listRelationships',
  'setRelationship',
  'recordMetric',
  'enqueueJob',
  'runJobs',
  'compilePermissions'
]) {
  assert.ok(ops.includes(token), `missing browser platform op: ${token}`);
}

assert.match(desktopCss, /width:\s*min\(24rem,\s*calc\(100vw - 1\.5rem\)\)/, 'desktop panel must stay inside viewport');
assert.match(desktopCss, /max-height:\s*min\(34rem,\s*74vh\)/, 'desktop panel must cap height');
assert.match(desktopCss, /min-height:\s*2\.75rem/, 'platform touch targets must be at least 44px-ish');
assert.match(mobileCss, /@media \(max-width:\s*760px\)/, 'mobile platform breakpoint missing');
assert.match(mobileCss, /width:\s*auto/, 'mobile platform panel must use fluid width');
assert.match(mobileCss, /flex-direction:\s*column/, 'mobile platform controls must stack');
assert.match(notificationCss, /width:\s*min\(22rem,\s*calc\(100vw - 1\.5rem\)\)/, 'notification panel must stay inside viewport');
assert.match(notificationCss, /min-height:\s*2\.75rem/, 'notification touch targets must be at least 44px-ish');
assert.match(notificationMobileCss, /@media \(max-width:\s*760px\)/, 'mobile notification breakpoint missing');
assert.match(notificationMobileCss, /width:\s*auto/, 'mobile notification panel must use fluid width');
assert.match(revamped, /platform-panels\.css/, 'desktop platform css import missing');
assert.match(revamped, /platform-mobile\.css/, 'mobile platform css import missing');
assert.match(revamped, /notifications\.css/, 'desktop notification css import missing');
assert.match(revamped, /notifications-mobile\.css/, 'mobile notification css import missing');

console.log('B"H platformCoverageStatic.test passed');
