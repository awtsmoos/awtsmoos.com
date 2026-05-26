// B"H
const assert = require('assert');
const fs = require('fs');

const routeFiles = [
  'geelooy/api/social/_awtsmoos.heichel.js',
  'geelooy/api/social/_awtsmoos.posts.js',
  'geelooy/api/social/_awtsmoos.series.js',
  'geelooy/api/social/_awtsmoos.alias.js',
  'geelooy/api/social/_awtsmoos.mail.js',
  'geelooy/api/social/_awtsmoos.comments.js',
  'geelooy/api/social/_awtsmoos.keys.js',
  'geelooy/api/social/_awtsmoos.graph.js',
  'geelooy/api/social/_awtsmoos.content.js',
  'geelooy/api/social/_awtsmoos.notifications.js',
  'geelooy/api/social/_awtsmoos.packed.js',
  'geelooy/api/social/_awtsmoos.platform.js',
  'geelooy/api/social/_awtsmoos.migrations.js'
];

const commentRouteFiles = fs.readdirSync('geelooy/api/social/helper/comments/routes')
  .filter(file => file.endsWith('.js'))
  .map(file => `geelooy/api/social/helper/comments/routes/${file}`);

const requiredRoutes = [
  '/heichelos/:heichel/roles/:role',
  '/heichelos/:heichel/settings/submissions',
  '/heichelos/:heichel/submittedPosts',
  '/heichelos/:heichel/submittedPosts/approve',
  '/heichelos/:heichel/submittedPosts/deny',
  '/heichelos/:heichel/series/:series/editSeriesDetails',
  '/aliases/:alias/commentsMade/heichelos',
  '/aliases/:alias/commentsMade/heichel/:heichel/series',
  '/keys',
  '/keys/verify',
  '/keys/:key/revoke',
  '/graph/entity/resolve',
  '/graph/references',
  '/graph/reposts',
  '/content/share',
  '/notifications/:alias/:notification/read',
  '/notifications/fanout',
  '/packed/migrations/posts/v2/run',
  '/packed/repair/posts/manifests',
  '/packed/feed/materialize',
  '/federation/import',
  '/comments/thread/:post/ranked',
  '/comments/thread/append',
  '/feed/discover',
  '/feed/trending',
  '/feed/heichel/:heichel',
  '/feed/home',
  '/sync/pull/:alias',
  '/cache/invalidate',
  '/cache/get',
  '/notifications/digest/:alias',
  '/jobs/run',
  '/graph/transaction',
  '/permissions/compile',
  '/sync/op',
  '/cache/set',
  '/analytics/metric',
  '/jobs/enqueue',
  '/mod/escalations',
  '/mod/queues',
  '/mod/actions',
  '/mod/reports',
  '/media/attach',
  '/media/register',
  '/relationships/:alias/:type/:target',
  '/relationships/:alias',
  '/search/query',
  '/search/index',
  '/abuse/rateLimit/check',
  '/live/replay',
  '/live/presence',
  '/live/subscribe',
  '/live/publish',
  '/packed/compact',
  '/packed/keys',
  '/packed/read',
  '/packed/integrity',
  '/packed/snapshot',
  '/packed/migrations/posts/v2/dryRun',
  '/packed/stats',
  '/migrations/posts/v2/run',
  '/migrations/posts/v2/dryRun',
  '/notifications/:alias/poll',
  '/notifications/:alias/unread/count',
  '/notifications/:alias',
  '/content/repost',
  '/content/heichelos/:heichel/posts/:post/sections',
  '/content/heichelos/:heichel/questions/:question/answers',
  '/content/heichelos/:heichel/questions'
];

function routeKeys(source) {
  return source.split('\n')
    .map((line, index) => ({ line, index: index + 1 }))
    .map(({ line, index }) => ({ match: line.match(/^\s*["'`]([^"'`]+)["'`]\s*:/), index }))
    .filter(item => item.match && item.match[1].startsWith('/'))
    .map(item => ({ route: item.match[1], line: item.index }));
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
  const duplicates = [...seen.entries()].filter(([, lines]) => lines.length > 1);
  assert.deepEqual(duplicates, [], `${file} duplicate route keys: ${JSON.stringify(duplicates)}`);
}

const allRoutes = new Set();
for (const file of routeFiles) {
  for (const entry of routeKeys(fs.readFileSync(file, 'utf8'))) allRoutes.add(entry.route);
}
for (const file of commentRouteFiles) {
  for (const entry of routeKeys(fs.readFileSync(file, 'utf8'))) allRoutes.add(entry.route);
}
for (const route of requiredRoutes) {
  assert.ok(allRoutes.has(route), `missing route ${route}`);
}

console.log('B"H routeCoverage.test passed');
