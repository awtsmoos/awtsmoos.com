//B"H
/**
 * @module PlatformRoutes
 * @description
 * Operational platform routes: live, rate limit, search, follow, media, mod,
 * jobs, analytics, cache, sync, permission, federation, feed, and platform
 * thread events. The thread routes await their storage helpers so route output
 * is real data, not a Promise-shaped shadow.
 */

const { publishLiveEvent, subscribeLiveChannel, setPresence, replayLiveEvents } = require('./helper/platform/live.js');
const { checkRateLimit } = require('./helper/platform/rateLimit.js');
const { indexSearchDocument, searchPacked } = require('./helper/platform/search.js');
const { setRelationship, listRelationships } = require('./helper/platform/follow.js');
const ops = require('./helper/platform/ops.js');
const { runGraphTransaction, listGraphTransactions } = require('./helper/platform/graphTransactions.js');
const { runQueuedJobs, createNotificationDigest } = require('./helper/platform/jobRunner.js');
const { cacheGet, cacheInvalidate, syncPull } = require('./helper/platform/cacheSync.js');
const { feedHome, feedHeichel, feedTrending, feedDiscover } = require('./helper/platform/feedRoutes.js');
const { appendThreadComment, rankedThread } = require('./helper/platform/commentThreads.js');
const { er } = require('./helper/general.js');

function json(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function method($i, name) {
  return $i.request.method === name;
}

module.exports = ({ $i } = {}) => ({
  '/live/publish': async () => method($i, 'POST') ? { success: publishLiveEvent({ $i, channel: $i.$_POST.channel, type: $i.$_POST.type, actor: $i.$_POST.actor, payload: json($i.$_POST.payload) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/live/subscribe': async () => method($i, 'POST') ? { success: subscribeLiveChannel({ $i, aliasId: $i.$_POST.aliasId, channel: $i.$_POST.channel }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/live/presence': async () => method($i, 'POST') ? { success: setPresence({ $i, aliasId: $i.$_POST.aliasId, channel: $i.$_POST.channel, status: $i.$_POST.status }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/live/replay': async () => method($i, 'GET') ? { success: replayLiveEvents({ $i, channel: $i.$_GET.channel, since: $i.$_GET.since, limit: Number($i.$_GET.limit || 100) }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/abuse/rateLimit/check': async () => method($i, 'POST') ? { success: checkRateLimit({ $i, subject: $i.$_POST.subject, bucket: $i.$_POST.bucket, limit: $i.$_POST.limit || 60, windowMs: $i.$_POST.windowMs || 60000, cost: $i.$_POST.cost || 1 }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/search/index': async () => method($i, 'POST') ? { success: indexSearchDocument({ $i, domain: $i.$_POST.domain, id: $i.$_POST.id, text: $i.$_POST.text, entity: json($i.$_POST.entity) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/search/query': async () => method($i, 'GET') ? { success: searchPacked({ $i, q: $i.$_GET.q, domain: $i.$_GET.domain }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/relationships/:alias': async vars => method($i, 'GET') ? listRelationships({ $i, aliasId: vars.alias, type: $i.$_GET.type }) : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/relationships/:alias/:type/:target': async vars => method($i, 'POST') ? setRelationship({ $i, fromAlias: vars.alias, type: vars.type, toAlias: vars.target }) : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/media/register': async () => method($i, 'POST') ? { success: ops.registerMedia({ $i, mediaId: $i.$_POST.mediaId, aliasId: $i.$_POST.aliasId, metadata: json($i.$_POST.metadata) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/media/attach': async () => method($i, 'POST') ? { success: ops.attachMedia({ $i, mediaId: $i.$_POST.mediaId, entity: json($i.$_POST.entity) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/mod/reports': async () => method($i, 'POST') ? { success: ops.createModerationRecord({ $i, type:'report', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) } : ops.listOps({ $i, kind:'moderation' }),
  '/mod/actions': async () => method($i, 'POST') ? { success: ops.createModerationRecord({ $i, type:'action', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) } : ops.listOps({ $i, kind:'moderation' }),
  '/mod/queues': async () => ops.listOps({ $i, kind:'moderation' }),
  '/mod/escalations': async () => method($i, 'POST') ? { success: ops.createModerationRecord({ $i, type:'escalation', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) } : ops.listOps({ $i, kind:'moderation' }),
  '/jobs/enqueue': async () => method($i, 'POST') ? { success: ops.enqueueJob({ $i, type: $i.$_POST.type, payload: json($i.$_POST.payload), runAt: Number($i.$_POST.runAt || Date.now()) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/analytics/metric': async () => method($i, 'POST') ? { success: ops.recordMetric({ $i, name: $i.$_POST.name, value: $i.$_POST.value, tags: json($i.$_POST.tags) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/cache/set': async () => method($i, 'POST') ? { success: ops.cacheSet({ $i, key: $i.$_POST.key, value: json($i.$_POST.value), ttlMs: $i.$_POST.ttlMs || 60000 }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/sync/op': async () => method($i, 'POST') ? { success: ops.syncOp({ $i, aliasId: $i.$_POST.aliasId, op: $i.$_POST.op, payload: json($i.$_POST.payload) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/permissions/compile': async () => method($i, 'POST') ? { success: ops.compilePermission({ $i, subject: $i.$_POST.subject, resource: $i.$_POST.resource, rules: json($i.$_POST.rules) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/federation/import': async () => method($i, 'POST') ? { success: ops.federationImport({ $i, remoteHeichel: $i.$_POST.remoteHeichel, signedPayload: json($i.$_POST.signedPayload) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/graph/transaction': async () => method($i, 'POST') ? await runGraphTransaction({ $i, actor: $i.$_POST.actor, edges: json($i.$_POST.edges, []) }) : listGraphTransactions({ $i }),
  '/jobs/run': async () => method($i, 'POST') ? { success: await runQueuedJobs({ $i, limit: Number($i.$_POST.limit || 10) }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/notifications/digest/:alias': async vars => method($i, 'POST') ? { success: await createNotificationDigest({ $i, aliasId: vars.alias }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/cache/get': async () => method($i, 'GET') ? cacheGet({ $i, key: $i.$_GET.key }) : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/cache/invalidate': async () => method($i, 'POST') ? { success: cacheInvalidate({ $i, key: $i.$_POST.key || $i.$_GET.key }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/sync/pull/:alias': async vars => method($i, 'GET') ? syncPull({ $i, aliasId: vars.alias, since: $i.$_GET.since || 0, limit: Number($i.$_GET.limit || 100) }) : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/feed/home': async () => method($i, 'GET') ? { success: feedHome({ $i, aliasId: $i.$_GET.aliasId || '', limit: Number($i.$_GET.limit || 50) }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/feed/heichel/:heichel': async vars => method($i, 'GET') ? { success: feedHeichel({ $i, heichelId: vars.heichel, limit: Number($i.$_GET.limit || 50) }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/feed/trending': async () => method($i, 'GET') ? { success: feedTrending({ $i, limit: Number($i.$_GET.limit || 50) }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/feed/discover': async () => method($i, 'GET') ? { success: feedDiscover({ $i, limit: Number($i.$_GET.limit || 50) }) } : er({ code:'BAD_METHOD', message:'Use GET.' }),
  '/comments/thread/append': async () => method($i, 'POST') ? { success: await appendThreadComment({ $i, postId: $i.$_POST.postId, commentId: $i.$_POST.commentId, parentId: $i.$_POST.parentId, aliasId: $i.$_POST.aliasId, content: $i.$_POST.content }) } : er({ code:'BAD_METHOD', message:'Use POST.' }),
  '/comments/thread/:post/ranked': async vars => method($i, 'GET') ? { success: await rankedThread({ $i, postId: vars.post }) } : er({ code:'BAD_METHOD', message:'Use GET.' })
});
