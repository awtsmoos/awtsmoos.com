// B"H
const assert = require('assert');
const fs = require('fs');

const routeFiles = [
  'geelooy/api/social/_awtsmoos.heichel.js', 'geelooy/api/social/_awtsmoos.posts.js', 'geelooy/api/social/_awtsmoos.series.js', 'geelooy/api/social/_awtsmoos.alias.js', 'geelooy/api/social/_awtsmoos.profile.js', 'geelooy/api/social/_awtsmoos.mail.js', 'geelooy/api/social/_awtsmoos.nodeOs.js', 'geelooy/api/social/_awtsmoos.nodeOs.js', 'geelooy/api/social/_awtsmoos.comments.js', 'geelooy/api/social/_awtsmoos.keys.js', 'geelooy/api/social/_awtsmoos.graph.js', 'geelooy/api/social/_awtsmoos.content.js', 'geelooy/api/social/_awtsmoos.entities.js', 'geelooy/api/social/_awtsmoos.assets.js', 'geelooy/api/social/_awtsmoos.editor.js', 'geelooy/api/social/_awtsmoos.governance.js', 'geelooy/api/social/_awtsmoos.notifications.js', 'geelooy/api/social/_awtsmoos.packed.js', 'geelooy/api/social/_awtsmoos.platform.js', 'geelooy/api/social/_awtsmoos.migrations.js'
];

const commentRouteFiles = fs.readdirSync('geelooy/api/social/helper/comments/routes').filter(file => file.endsWith('.js')).map(file => `geelooy/api/social/helper/comments/routes/${file}`);

const requiredRoutes = [
  '/node-os/path', '/node-os/nodes/:node', '/node-os/nodes/:node/children', '/node-os/nodes', '/node-os/mount/entity/:type/:id', '/node-os/mount/assets/:alias', '/node-os/migrations/dry-run', '/node-os/migrations/run',
  '/node-os/path', '/node-os/nodes/:node', '/node-os/nodes/:node/children', '/node-os/nodes', '/node-os/mount/entity/:type/:id', '/node-os/mount/assets/:alias', '/node-os/migrations/dry-run', '/node-os/migrations/run',
  '/mail/universe/mirror', '/mail/universe/:thread/link',
  '/entities/universe', '/entities/universe/:type/:id', '/entities/universe/:type/:id/children', '/entities/universe/:type/:id/edges', '/entities/universe/:type/:id/range-reference/preview', '/entities/universe/:type/:id/range-reference/attach', '/entities/universe/:type/:id/snapshot', '/entities/universe/:type/:id/fork', '/entities/universe/:type/:id/dna',
  '/assets/:alias/upload', '/assets/:alias', '/assets/:alias/:asset/bind', '/assets/:alias/manifest/:asset', '/assets/:alias/:kind/:asset',
  '/editor/posts/drafts', '/editor/posts/drafts/:alias/:draft', '/editor/posts/drafts/publish', '/editor/heichelos/:heichel/posts/:post/verses/:verse/delete-preview', '/editor/heichelos/:heichel/posts/:post/verses/:verse', '/editor/heichelos/:heichel/posts/:post/subsections/:subsection/delete-preview', '/editor/heichelos/:heichel/posts/:post/subsections/:subsection',
  '/heichelos/:heichel/posts/:post/comment-tree', '/heichelos/:heichel/questions/:question/comment-tree', '/heichelos/:heichel/answers/:answer/comment-tree', '/heichelos/:heichel/posts/:post/comments/:comment', '/heichelos/:heichel/posts/:post/comments/:comment/replies', '/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies', '/entities/:heichel/:entity/comment-tree', '/entities/:heichel/:entity/comments/:comment/replies', '/entities/:heichel/:entity/comments/:comment/sections/:section/replies', '/comments/url/:comment', '/heichelos/:heichel/posts/:post/verses/:verse/comments', '/heichelos/:heichel/posts/:post/subsections/:subsection/comments',
  '/heichelos/:heichel/settings/full', '/heichelos/:heichel/members', '/heichelos/:heichel/invites', '/heichelos/:heichel/invites/:invite/accept', '/heichelos/:heichel/submissions/full', '/heichelos/:heichel/submissions/:submission/approve', '/heichelos/:heichel/submissions/:submission/reject', '/heichelos/:heichel/submissions/:submission/publish',
  '/profile/meta', '/profile/batch', '/profile/feed', '/profile/templates', '/profile/:alias', '/profile/:alias/posts', '/profile/:alias/comments', '/profile/:alias/activity', '/profile/:alias/tree', '/profile/:alias/series-tree', '/profile/:alias/heichelos', '/alias/:alias/history',
  '/alias/:alias/profile', '/alias/:alias/profile/template', '/heichelos/:heichel/roles/:role', '/heichelos/:heichel/settings/submissions',
  '/heichelos/:heichel/submittedPosts', '/heichelos/:heichel/submittedPosts/approve', '/heichelos/:heichel/submittedPosts/deny', '/heichelos/:heichel/series/:series/editSeriesDetails',
  '/aliases/:alias/commentsMade/heichelos', '/aliases/:alias/commentsMade/heichel/:heichel/series', '/keys', '/keys/verify', '/keys/:key/revoke',
  '/graph/entity/resolve', '/graph/references', '/graph/reposts', '/content/share', '/content/repost', '/content/heichelos/:heichel/posts',
  '/content/heichelos/:heichel/posts/:post/sections', '/content/heichelos/:heichel/questions/:question/answers', '/content/heichelos/:heichel/questions',
  '/notifications/:alias/:notification/read', '/notifications/fanout', '/notifications/:alias/poll', '/notifications/:alias/unread/count', '/notifications/:alias',
  '/packed/migrations/posts/v2/run', '/packed/repair/posts/manifests', '/packed/feed/materialize', '/packed/migrations/posts/v2/dryRun', '/packed/stats',
  '/packed/compact', '/packed/keys', '/packed/read', '/packed/integrity', '/packed/snapshot', '/federation/import', '/comments/thread/:post/ranked',
  '/comments/thread/append', '/feed/discover', '/feed/trending', '/feed/heichel/:heichel', '/feed/home', '/sync/pull/:alias', '/cache/invalidate',
  '/cache/get', '/cache/set', '/notifications/digest/:alias', '/jobs/run', '/jobs/enqueue', '/graph/transaction', '/permissions/compile', '/sync/op',
  '/analytics/metric', '/mod/escalations', '/mod/queues', '/mod/actions', '/mod/reports', '/media/attach', '/media/register',
  '/relationships/:alias/:type/:target', '/relationships/:alias', '/search/query', '/search/index', '/abuse/rateLimit/check', '/live/replay',
  '/live/presence', '/live/subscribe', '/live/publish', '/migrations/posts/v2/run', '/migrations/posts/v2/dryRun'
];

function routeKeys(source) {
  return source.split('\n').map((line, index) => ({ line, index: index + 1 })).map(({ line, index }) => ({ match: line.match(/^\s*["'`]([^"'`]+)["'`]\s*:/), index })).filter(item => item.match && item.match[1].startsWith('/')).map(item => ({ route: item.match[1], line: item.index }));
}

for (const file of routeFiles) {
  const source = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /return \{hi:3\}/, `${file} must not contain debug stub responses`);
  assert.doesNotMatch(source, /coming soon|not yet implemented|TODO|TBD|FIXME|HACK|console\.log/, `${file} has active marker/debug text`);
  const seen = new Map();
  for (const entry of routeKeys(source)) {
    if (!seen.has(entry.route)) seen.set(entry.route, []);
    seen.get(entry.route).push(entry.line);
  }
  assert.deepEqual([...seen.entries()].filter(([, lines]) => lines.length > 1), [], `${file} duplicate route keys`);
}

const allRoutes = new Set();
for (const file of routeFiles) for (const entry of routeKeys(fs.readFileSync(file, 'utf8'))) allRoutes.add(entry.route);
for (const file of commentRouteFiles) for (const entry of routeKeys(fs.readFileSync(file, 'utf8'))) allRoutes.add(entry.route);
for (const route of requiredRoutes) assert.ok(allRoutes.has(route), `missing route ${route}`);
console.log('B"H routeCoverage.test passed');
