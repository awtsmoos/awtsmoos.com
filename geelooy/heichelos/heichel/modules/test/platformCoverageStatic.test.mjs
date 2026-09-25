//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file platformCoverageStatic.test.mjs
 * @description The Awtsmoos keeps operational breadth alive while responsive clay
 * moves into logical properties and a dedicated mobile garment; Awtsmoos.com proves
 * canonical actions, lazy diagnostics, notifications, browser ops, and touch-safe bounds.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const catalog = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platform/PlatformActionCatalog.js', 'utf8');
const view = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platform/PlatformPanelView.js', 'utf8');
const panel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/platformPanel.js', 'utf8');
const notificationsPanel = fs.readFileSync('geelooy/heichelos/heichel/modules/ui/notificationsPanel.js', 'utf8');
const api = fs.readFileSync('geelooy/heichelos/heichel/modules/api.js', 'utf8');
const ops = fs.readFileSync('geelooy/heichelos/heichel/modules/api/platformOps.js', 'utf8');
const platformCss = fs.readFileSync('geelooy/heichelos/heichel/styles/platform-panel-v3.css', 'utf8');
const platformMobileCss = fs.readFileSync('geelooy/heichelos/heichel/styles/platform-panel-mobile-v3.css', 'utf8');
const notificationCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications.css', 'utf8');
const notificationMobileCss = fs.readFileSync('geelooy/style/heichelos/revamped-partials/notifications-mobile.css', 'utf8');
const revamped = fs.readFileSync('geelooy/style/heichelos/heichel.revamped.css', 'utf8');

const expectedActions = [
	'cache', 'db', 'digest', 'feed', 'graph', 'jobs', 'media', 'ops', 'permissions',
	'presence', 'relationships', 'searchIndex', 'sync', 'thread'
];
const catalogActions = [...catalog.matchAll(/\['([^']+)',\s*'[^']+'\]/g)].map(match => match[1]);
const requiredOps = [
	'moderationQueues', 'moderationReport', 'moderationAction', 'moderationEscalate',
	'migrationDryRun', 'migrationRun', 'federationImport', 'mediaRegister', 'mediaAttach',
	'listRelationships', 'setRelationship', 'recordMetric', 'enqueueJob', 'runJobs', 'compilePermissions'
];

/** Canonical action breadth and progressive disclosure remain complete. */
test('Platform catalog and lazy view preserve canonical actions', () => {
	assert.deepEqual(catalogActions, [...new Set(catalogActions)]);
	assert.deepEqual([...catalogActions].sort(), [...expectedActions].sort());
	assert.match(view, /PRIMARY_PLATFORM_ACTIONS/);
	assert.match(view, /ADVANCED_PLATFORM_ACTIONS/);
	assert.match(view, /createProgressiveDisclosure/);
	assert.match(panel, /shouldPrimePlatform/);
	assert.doesNotMatch(view, /innerHTML/);
});

/** Notifications and browser operations remain wired through current owners. */
test('Platform notifications and browser ops remain available', () => {
	assert.match(notificationsPanel, /aria-expanded/);
	assert.match(notificationsPanel, /setInterval/);
	assert.match(notificationsPanel, /markNotificationRead/);
	assert.equal((api.match(/platformOps\.js/g) || []).length, 1);
	for (const token of requiredOps) assert.ok(ops.includes(token), `missing browser platform op: ${token}`);
});

/** Desktop and mobile garments keep the panel inside the viewport with touch-safe controls. */
test('Platform responsive CSS uses logical viewport and touch contracts', () => {
	assert.match(platformCss, /inline-size:\s*min\(26\.25rem,\s*calc\(100vw - 1\.7rem\)\)/);
	assert.match(platformCss, /max-block-size:\s*min\(68dvh,\s*42rem\)/);
	assert.match(platformCss, /min-block-size:\s*44px/);
	assert.match(platformMobileCss, /@media \(max-width:\s*38\.75rem\)/);
	assert.match(platformMobileCss, /inline-size:\s*100%/);
	assert.match(notificationCss, /width:\s*min\(22rem,\s*calc\(100vw - 1\.5rem\)\)/);
	assert.match(notificationCss, /min-height:\s*2\.75rem/);
	assert.match(notificationMobileCss, /@media \(max-width:\s*760px\)/);
	assert.match(notificationMobileCss, /width:\s*auto/);
	assert.match(revamped, /notifications\.css/);
	assert.match(revamped, /notifications-mobile\.css/);
});
