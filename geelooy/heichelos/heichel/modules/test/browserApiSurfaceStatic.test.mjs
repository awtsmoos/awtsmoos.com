// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = fs.readFileSync('geelooy/heichelos/heichel/modules/api.js', 'utf8');
const files = {
  socialContent: fs.readFileSync('geelooy/heichelos/heichel/modules/api/socialContent.js', 'utf8'),
  comments: fs.readFileSync('geelooy/heichelos/heichel/modules/api/comments.js', 'utf8'),
  notifications: fs.readFileSync('geelooy/heichelos/heichel/modules/api/notifications.js', 'utf8'),
  platform: fs.readFileSync('geelooy/heichelos/heichel/modules/api/platform.js', 'utf8'),
  platformOps: fs.readFileSync('geelooy/heichelos/heichel/modules/api/platformOps.js', 'utf8'),
  semanticSearch: fs.readFileSync('geelooy/heichelos/heichel/modules/api/semanticSearch.js', 'utf8')
};

for (const exportPath of [
  './api/socialContent.js',
  './api/comments.js',
  './api/notifications.js',
  './api/platform.js',
  './api/platformOps.js',
  './api/semanticSearch.js'
]) {
  const matches = api.match(new RegExp(exportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [];
  assert.equal(matches.length, 1, `${exportPath} must be exported exactly once`);
}

const required = {
  socialContent: ['createQuestion', 'createAnswer', 'listAnswers', 'createSection', 'listSections', 'repostEntity', 'shareEntity', 'referenceEntity'],
  comments: ['createComment', 'replyToComment', 'listCommentAuthors', 'listCommentsByAlias'],
  notifications: ['listNotifications', 'getUnreadNotificationCount', 'markNotificationRead', 'createNotification', 'pollNotifications', 'fanoutNotifications'],
  platform: ['getFeedHome', 'getHeichelFeed', 'getTrendingFeed', 'getDiscoverFeed', 'searchSocial', 'indexSearchDocument', 'publishLiveEvent', 'subscribeLiveChannel', 'setLivePresence', 'replayLiveEvents', 'getPackedStats', 'getPackedSnapshot', 'pullSync', 'pushSyncOp', 'getCache', 'setCache', 'invalidateCache', 'checkRateLimit', 'materializeFeed', 'runGraphTransaction', 'listGraphTransactions', 'createNotificationDigest', 'appendThreadComment', 'getRankedThread'],
  platformOps: ['moderationQueues', 'moderationReport', 'moderationAction', 'moderationEscalate', 'migrationDryRun', 'migrationRun', 'federationImport', 'mediaRegister', 'mediaAttach', 'listRelationships', 'setRelationship', 'recordMetric', 'enqueueJob', 'runJobs', 'compilePermissions'],
  semanticSearch: ['semanticSearch']
};

for (const [file, names] of Object.entries(required)) {
  for (const name of names) {
    assert.ok(files[file].includes(name), `${file} missing browser API helper ${name}`);
  }
}

assert.match(files.semanticSearch, /search\/semantic/, 'semantic search helper must call semantic route');
assert.match(files.socialContent, /questions/, 'question route helper missing');
assert.match(files.socialContent, /sections/, 'section route helper missing');
assert.match(files.comments, /comments\/aliases/, 'comment alias route helper missing');
assert.match(files.notifications, /notifications\/fanout/, 'fanout helper missing');

console.log('B"H browserApiSurfaceStatic.test passed');
