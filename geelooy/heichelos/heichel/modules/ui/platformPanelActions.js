// B"H
/**
 * @module platformPanelActions
 * @description Action conductor for the advanced Awtsmoos platform panel.
 */
import {
  getHeichelFeed, getFeedHome, getTrendingFeed, getDiscoverFeed,
  searchSocial, indexSearchDocument, publishLiveEvent, subscribeLiveChannel,
  setLivePresence, replayLiveEvents, getPackedStats, getPackedSnapshot,
  pullSync, pushSyncOp, getCache, setCache, invalidateCache,
  materializeFeed, checkRateLimit, runGraphTransaction, listGraphTransactions,
  createNotificationDigest, appendThreadComment, getRankedThread
} from '../api/platform.js';
import { platformOps } from '../api/platformOps.js';
import { failAction, namedItems, renderDb, renderList, renderOps, setStatus } from './platformPanelRender.js';

export async function handleSearch(event, ctx) {
  event.preventDefault();
  const q = new FormData(event.currentTarget).get('q');
  const response = await searchSocial({ q, domain: 'post' });
  if (!response) return failAction(ctx, 'Search failed', 'Unable to load search results.');
  renderList(ctx, 'Search', response.success || []);
}

export async function runAction(action, ctx) {
  setStatus(ctx, `loading ${action}`);
  try {
    const ritual = actionRituals[action];
    const result = ritual ? await ritual(ctx) : true;
    if (result !== false) setStatus(ctx, 'ready');
  } catch (error) {
    setStatus(ctx, error.message || 'error');
  }
}

const actionRituals = {
  feed: renderFeed,
  presence: renderPresence,
  db: renderPackedDb,
  cache: renderCache,
  sync: renderSync,
  searchIndex: renderSearchIndex,
  graph: renderGraph,
  thread: renderThread,
  digest: renderDigest,
  media: renderMedia,
  relationships: renderRelationships,
  jobs: renderJobs,
  permissions: renderPermissions,
  ops: renderOperations
};

async function renderFeed(ctx) {
  const materialized = await materializeFeed({ heichelId: ctx.heichelId, aliasId: ctx.aliasId });
  if (!materialized) return failAction(ctx, 'Feed failed', 'Unable to materialize feed data.');
  const [home, heichel, trending, discover] = await Promise.all([
    getFeedHome({ aliasId: ctx.aliasId }),
    ctx.heichelId ? getHeichelFeed({ heichelId: ctx.heichelId }) : Promise.resolve({ success: { items: [] } }),
    getTrendingFeed(),
    getDiscoverFeed()
  ]);
  renderList(ctx, 'Feed', [
    ...namedItems('home', home?.success?.items),
    ...namedItems('heichel', heichel?.success?.items),
    ...namedItems('trending', trending?.success?.items),
    ...namedItems('discover', discover?.success?.items)
  ]);
}

async function renderPresence(ctx) {
  const channel = ctx.heichelId || 'global';
  const actor = ctx.aliasId || 'anonymous';
  await subscribeLiveChannel({ aliasId: actor, channel });
  await publishLiveEvent({ channel, actor, payload: { source: 'platform-panel' } });
  const presence = await setLivePresence({ aliasId: ctx.aliasId, channel, status: 'online' });
  if (!presence) return failAction(ctx, 'Live failed', 'Unable to set live presence.');
  const rate = await checkRateLimit({ subject: actor, bucket: 'ui.presence', limit: 120 });
  if (!rate) return failAction(ctx, 'Live failed', 'Unable to verify live rate limit.');
  const response = await replayLiveEvents({ channel, since: ctx.cursor });
  if (!response) return failAction(ctx, 'Live failed', 'Unable to replay live events.');
  renderList(ctx, 'Live', response.success || []);
}

async function renderPackedDb(ctx) {
  const stats = await getPackedStats();
  const snapshot = await getPackedSnapshot();
  if (!stats || !snapshot) return failAction(ctx, 'DB failed', 'Unable to load packed DB sharing state.');
  renderDb(ctx, stats.success || [], snapshot.success || {});
}

async function renderCache(ctx) {
  const key = `ui:${ctx.heichelId || 'global'}:${ctx.aliasId || 'anonymous'}`;
  const wrote = await setCache({ key, value: { openedAt: Date.now() } });
  const read = await getCache({ key });
  const invalidated = await invalidateCache({ key });
  renderList(ctx, 'Cache', [
    { title: `set: ${Boolean(wrote?.success || wrote?.key)}` },
    { title: `read: ${Boolean(read?.success || read?.value)}` },
    { title: `invalidated: ${Boolean(invalidated?.success || invalidated?.deleted)}` }
  ]);
}

async function renderSync(ctx) {
  await pushSyncOp({ aliasId: ctx.aliasId || 'anonymous', op: 'platform.panel.open', payload: { heichelId: ctx.heichelId } });
  const response = await pullSync({ aliasId: ctx.aliasId || 'anonymous', since: ctx.cursor });
  if (!response) return failAction(ctx, 'Sync failed', 'Unable to pull sync changes.');
  ctx.cursor = response.cursor || Date.now();
  renderList(ctx, 'Sync', response.success || []);
}

async function renderSearchIndex(ctx) {
  const response = await indexSearchDocument({
    domain: 'ui',
    id: `panel-${ctx.heichelId || 'global'}`,
    text: `Platform panel ${ctx.heichelId || 'global'} ${ctx.aliasId || ''}`,
    entity: { heichelId: ctx.heichelId, aliasId: ctx.aliasId }
  });
  renderList(ctx, 'Search index', [response?.success || response || { title: 'Index request completed' }]);
}

async function renderGraph(ctx) {
  const edge = { from: { type: 'alias', id: ctx.aliasId || 'anonymous' }, to: { type: 'heichel', id: ctx.heichelId || 'global' }, label: 'visited' };
  await runGraphTransaction({ actor: ctx.aliasId || 'anonymous', edges: [edge] });
  const response = await listGraphTransactions();
  renderList(ctx, 'Graph', response.success || response || []);
}

async function renderThread(ctx) {
  const postId = `panel-${ctx.heichelId || 'global'}`;
  await appendThreadComment({ postId, commentId: `ui-${Date.now()}`, aliasId: ctx.aliasId || 'anonymous', content: 'Panel thread pulse' });
  const response = await getRankedThread({ postId });
  renderList(ctx, 'Thread', response.success?.comments || response.comments || []);
}

async function renderDigest(ctx) {
  const response = await createNotificationDigest({ aliasId: ctx.aliasId || 'anonymous' });
  renderList(ctx, 'Digest', [response.success || response || { title: 'Digest requested' }]);
}

async function renderMedia(ctx) {
  const mediaId = `ui-media-${ctx.heichelId || 'global'}`;
  const registered = await platformOps.mediaRegister({ mediaId, aliasId: ctx.aliasId || 'anonymous', metadata: { source: 'platform-panel' } });
  const attached = await platformOps.mediaAttach({ mediaId, entity: { type: 'heichel', id: ctx.heichelId || 'global' } });
  renderList(ctx, 'Media', [registered.success || registered, attached.success || attached]);
}

async function renderRelationships(ctx) {
  await platformOps.setRelationship({ aliasId: ctx.aliasId || 'anonymous', type: 'follow', target: ctx.heichelId || 'global' });
  const response = await platformOps.listRelationships({ aliasId: ctx.aliasId || 'anonymous', type: 'follow' });
  renderList(ctx, 'Relationships', response.success || response || []);
}

async function renderJobs(ctx) {
  await platformOps.recordMetric({ name: 'platform.panel.jobs', tags: { heichelId: ctx.heichelId || 'global' } });
  await platformOps.enqueueJob({ type: 'digest', payload: { aliasId: ctx.aliasId || 'anonymous' } });
  const response = await platformOps.runJobs({ limit: 5 });
  renderList(ctx, 'Jobs', response.success || response || []);
}

async function renderPermissions(ctx) {
  const response = await platformOps.compilePermissions({ subject: ctx.aliasId || 'anonymous', resource: ctx.heichelId || 'global', rules: [{ allow: true, source: 'ui' }] });
  renderList(ctx, 'Permissions', [response.success || response || { title: 'Permissions compiled' }]);
}

async function renderOperations(ctx) {
  const queues = await platformOps.moderationQueues();
  await platformOps.moderationReport({ target: { type: 'heichel', id: ctx.heichelId || 'global' }, actor: ctx.aliasId || 'anonymous', reason: 'panel review' });
  await platformOps.federationImport({ remoteHeichel: ctx.heichelId || 'global', signedPayload: { source: 'platform-panel' } });
  const migration = await platformOps.migrationDryRun({ heichelId: ctx.heichelId, seriesId: 'root' });
  if (!queues || !migration) return failAction(ctx, 'Ops failed', 'Unable to load moderation and migration state.');
  renderOps(ctx, queues.success || queues, migration.success || migration);
}
