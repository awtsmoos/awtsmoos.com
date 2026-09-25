//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserApiSurfaceStatic.test.mjs
 * @description The Awtsmoos keeps browser-facing helpers explicit while transport
 * details evolve beneath them; Awtsmoos.com protects the public API surface and
 * the native comment-tree path that now derives alias views locally.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const api = fs.readFileSync('geelooy/heichelos/heichel/modules/api.js', 'utf8');
const files = {
	socialContent: fs.readFileSync('geelooy/heichelos/heichel/modules/api/socialContent.js', 'utf8'),
	comments: fs.readFileSync('geelooy/heichelos/heichel/modules/api/comments.js', 'utf8'),
	notifications: fs.readFileSync('geelooy/heichelos/heichel/modules/api/notifications.js', 'utf8'),
	platform: fs.readFileSync('geelooy/heichelos/heichel/modules/api/platform.js', 'utf8'),
	platformOps: fs.readFileSync('geelooy/heichelos/heichel/modules/api/platformOps.js', 'utf8'),
	semanticSearch: fs.readFileSync('geelooy/heichelos/heichel/modules/api/semanticSearch.js', 'utf8')
};

const exports = [
	'./api/socialContent.js', './api/comments.js', './api/notifications.js',
	'./api/platform.js', './api/platformOps.js', './api/semanticSearch.js'
];
const required = {
	socialContent: ['createQuestion', 'createAnswer', 'listAnswers', 'createSection', 'listSections', 'repostEntity', 'shareEntity', 'referenceEntity'],
	comments: ['createComment', 'replyToComment', 'listCommentAuthors', 'listCommentsByAlias'],
	notifications: ['listNotifications', 'getUnreadNotificationCount', 'markNotificationRead', 'createNotification', 'pollNotifications', 'fanoutNotifications'],
	platform: ['getFeedHome', 'getHeichelFeed', 'getTrendingFeed', 'getDiscoverFeed', 'searchSocial', 'indexSearchDocument', 'publishLiveEvent', 'subscribeLiveChannel', 'setLivePresence', 'replayLiveEvents', 'getPackedStats', 'getPackedSnapshot', 'pullSync', 'pushSyncOp', 'getCache', 'setCache', 'invalidateCache', 'checkRateLimit', 'materializeFeed', 'runGraphTransaction', 'listGraphTransactions', 'createNotificationDigest', 'appendThreadComment', 'getRankedThread'],
	platformOps: ['moderationQueues', 'moderationReport', 'moderationAction', 'moderationEscalate', 'migrationDryRun', 'migrationRun', 'federationImport', 'mediaRegister', 'mediaAttach', 'listRelationships', 'setRelationship', 'recordMetric', 'enqueueJob', 'runJobs', 'compilePermissions'],
	semanticSearch: ['semanticSearch']
};

/** Barrel exports and public helper names remain complete and unique. */
test('browser API surface preserves canonical exports and helper names', () => {
	for (const exportPath of exports) {
		const escaped = exportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		assert.equal((api.match(new RegExp(escaped, 'g')) || []).length, 1, `${exportPath} must be exported exactly once`);
	}
	for (const [file, names] of Object.entries(required)) {
		for (const name of names) assert.ok(files[file].includes(name), `${file} missing browser API helper ${name}`);
	}
});

/** Current helpers continue to target the expected social and semantic routes. */
test('browser API route contracts remain explicit', () => {
	assert.match(files.semanticSearch, /search\/semantic/);
	assert.match(files.socialContent, /questions/);
	assert.match(files.socialContent, /sections/);
	assert.match(files.notifications, /notifications\/fanout/);
});

/** Alias views derive recursively from native comment-tree transport. */
test('comment alias helpers derive from comment-tree transport', () => {
	assert.match(files.comments, /\/comment-tree/);
	assert.match(files.comments, /function flatten\(rows = \[\]\)/);
	assert.match(files.comments, /out\.push\(\.\.\.flatten\(row\?\.replies \|\| \[\]\)\)/);
	assert.match(files.comments, /return flatten\(response\?\.success \|\| \[\]\)/);
	assert.match(files.comments, /new Set\(aliases\)/);
	assert.match(files.comments, /listCommentAuthors/);
	assert.match(files.comments, /listCommentsByAlias/);
	assert.match(files.comments, /\.filter\(/);
});
