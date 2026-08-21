//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformCoverageStaticTest
 * @description The Awtsmoos lets operational breadth survive architectural refinement;
 * Awtsmoos.com proves the canonical catalog, retractable view, mobile Platform garment, notifications, and browser ops remain complete.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalog = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platform/PlatformActionCatalog.js', 'utf8');
const view = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platform/PlatformPanelView.js', 'utf8');
const panel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platformPanel.js', 'utf8');
const notificationsPanel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/notificationsPanel.js', 'utf8');
const api = fs.readFileSync('geelooy/heichelos/heichel/modules/api.js', 'utf8');
const ops = fs.readFileSync('geelooy/heichelos/heichel/modules/api/platformOps.js', 'utf8');
const platformCss = fs.readFileSync('geelooy/heichelos/heichel/styles/platform-panel-v3.css', 'utf8');
const notificationCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications.css', 'utf8');
const notificationMobileCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications-mobile.css', 'utf8');
const revamped = fs.readFileSync('geelooy/style/heichelos/heichel.revamped.css', 'utf8');

const expectedActions = [
	'cache', 'db', 'digest', 'feed', 'graph', 'jobs', 'media', 'ops', 'permissions',
	'presence', 'relationships', 'searchIndex', 'sync', 'thread'
];
const catalogActions = [...catalog.matchAll(/\['([^']+)',\s*'[^']+'\]/g)].map(match => match[1]);
assert.deepEqual(catalogActions, [...new Set(catalogActions)], 'Platform catalog contains duplicate actions');
assert.deepEqual([...catalogActions].sort(), [...expectedActions].sort(), 'Platform catalog must preserve all canonical actions');
assert.match(view, /PRIMARY_PLATFORM_ACTIONS/, 'Platform view must render primary catalog actions');
assert.match(view, /ADVANCED_PLATFORM_ACTIONS/, 'Platform view must render retractable advanced catalog actions');
assert.match(view, /createProgressiveDisclosure/, 'Platform view must use shared progressive disclosure');
assert.match(panel, /shouldPrimePlatform/, 'Platform facade must lazily prime diagnostics');
assert.doesNotMatch(view, /innerHTML/, 'Platform view must use safe DOM construction');

assert.match(notificationsPanel, /aria-expanded/, 'notifications toggle must expose expanded state');
assert.match(notificationsPanel, /setInterval/, 'notifications panel must poll for live updates');
assert.match(notificationsPanel, /markNotificationRead/, 'notifications panel must expose mark-read flow');
assert.equal((api.match(/platformOps\.js/g) || []).length, 1, 'api.js must export platformOps exactly once');

for (const token of [
	'moderationQueues', 'moderationReport', 'moderationAction', 'moderationEscalate',
	'migrationDryRun', 'migrationRun', 'federationImport', 'mediaRegister', 'mediaAttach',
	'listRelationships', 'setRelationship', 'recordMetric', 'enqueueJob', 'runJobs', 'compilePermissions'
]) {
	assert.ok(ops.includes(token), `missing browser platform op: ${token}`);
}

assert.match(platformCss, /width:\s*min\(420px,\s*calc\(100vw - 28px\)\)/, 'Platform must stay inside desktop viewport');
assert.match(platformCss, /max-height:\s*min\(72vh,\s*680px\)/, 'Platform body must cap height');
assert.match(platformCss, /min-height:\s*44px/, 'Platform controls must use 44px touch targets');
assert.match(platformCss, /@media \(max-width:\s*620px\)/, 'Platform mobile breakpoint missing');
assert.match(platformCss, /left:\s*10px/, 'mobile Platform must use fluid edge spacing');
assert.match(notificationCss, /width:\s*min\(22rem,\s*calc\(100vw - 1\.5rem\)\)/, 'notification panel must stay inside viewport');
assert.match(notificationCss, /min-height:\s*2\.75rem/, 'notification touch targets must remain at least 44px-ish');
assert.match(notificationMobileCss, /@media \(max-width:\s*760px\)/, 'mobile notification breakpoint missing');
assert.match(notificationMobileCss, /width:\s*auto/, 'mobile notification panel must use fluid width');
assert.match(revamped, /notifications\.css/, 'desktop notification css import missing');
assert.match(revamped, /notifications-mobile\.css/, 'mobile notification css import missing');
console.log('B"H platformCoverageStatic.test passed');
