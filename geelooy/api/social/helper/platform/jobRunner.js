//B"H
/**
 * @module PlatformJobRunner
 * @description Chapter 649: operational jobs now read notification pages as
 * pages, not arrays. The runner keeps compact/feed/digest jobs small, visible,
 * and anchored to the caller's platform store vessel.
 */
const { put, list } = require('./platformStore.js');
const { compactShard, compactAllShards } = require('../packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('../packed/feedMaterializer.js');
const { listNotifications } = require('../notifications.js');
const { listPackedRecords } = require('../packed/socialPacked.js');

function queuedJobs($i, limit = 10) { return list({ $i, shard: 'audit', predicate: r => r.meta?.kind === 'job' && r.value?.status === 'queued' }).map(r => r.value).slice(0, limit); }
function writeJob($i, job, status, extra = {}) { const next = { ...job, ...extra, status, updatedAt: Date.now() }; put({ $i, shard: 'audit', parts: ['jobs', job.type, job.id], value: next, meta: { kind: 'job', type: job.type, status } }); return next; }
function materializeFeeds({ $i, job }) { return { heichelFeed: materializeHeichelFeed({ $i, heichelId: job.payload?.heichelId || '', limit: job.payload?.limit || 100 }), aliasFeed: job.payload?.aliasId ? materializeAliasFeed({ $i, aliasId: job.payload.aliasId, limit: job.payload?.limit || 100 }) : null }; }
function packedUnreadNotifications({ $i, aliasId }) { return listPackedRecords({ $i, shard: 'notify' }).filter(record => record.meta?.kind === 'notification' && record.value?.toAliasId === aliasId && !record.value?.read).map(record => record.value); }
async function unreadNotifications({ $i, aliasId }) {
  const listed = await listNotifications({ $i, aliasId, includeRead: false });
  const direct = Array.isArray(listed?.success?.items) ? listed.success.items : Array.isArray(listed?.success) ? listed.success : [];
  return direct.length ? direct : packedUnreadNotifications({ $i, aliasId });
}
async function createNotificationDigest({ $i, aliasId }) {
  const notes = await unreadNotifications({ $i, aliasId });
  const digest = { id: `digest_${aliasId}_${Date.now()}`, aliasId, count: notes.length, notificationIds: notes.map(n => n.id), createdAt: Date.now() };
  put({ $i, shard: 'notify', parts: ['notificationDigests', aliasId, digest.id], value: digest, meta: { kind: 'notificationDigest' } });
  return digest;
}
async function runJob({ $i, job }) {
  const started = writeJob($i, job, 'running', { attempts: Number(job.attempts || 0) + 1, startedAt: Date.now() });
  try {
    let result = { noop: true, type: job.type };
    if (job.type === 'compact') result = job.payload?.shard ? compactShard({ $i, shard: job.payload.shard }) : compactAllShards({ $i });
    if (job.type === 'feed.materialize') result = materializeFeeds({ $i, job });
    if (job.type === 'notification.digest') result = await createNotificationDigest({ $i, aliasId: job.payload?.aliasId });
    return writeJob($i, started, 'done', { result, finishedAt: Date.now() });
  } catch (error) { return writeJob($i, started, 'failed', { error: error.message, finishedAt: Date.now() }); }
}
async function runQueuedJobs({ $i, limit = 10 }) { const results = []; for (const job of queuedJobs($i, limit)) results.push(await runJob({ $i, job })); return { ran: results.length, results }; }
module.exports = { queuedJobs, runJob, runQueuedJobs, createNotificationDigest };
