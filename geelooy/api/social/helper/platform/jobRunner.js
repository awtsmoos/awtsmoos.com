//B"H
/** Tiny packed job runner for operational maintenance jobs. */
const { put, list } = require('./platformStore.js');
const { compactShard, compactAllShards } = require('../packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('../packed/feedMaterializer.js');
const { listNotifications } = require('../notifications.js');
const { listPackedRecords } = require('../packed/socialPacked.js');
function queuedJobs($i, limit = 10) { return list({ $i, shard:'audit', predicate:r=>r.meta?.kind==='job' && r.value?.status==='queued' }).map(r=>r.value).slice(0, limit); }
async function runJob({ $i, job }) {
  const started = { ...job, status:'running', attempts:Number(job.attempts||0)+1, startedAt:Date.now() };
  put({ $i, shard:'audit', parts:['jobs', job.type, job.id], value: started, meta:{kind:'job', type:job.type, status:'running'} });
  try {
    let result = null;
    if (job.type === 'compact') result = job.payload?.shard ? compactShard({ $i, shard: job.payload.shard }) : compactAllShards({ $i });
    else if (job.type === 'feed.materialize') result = { heichelFeed: materializeHeichelFeed({ $i, heichelId: job.payload?.heichelId || '', limit: job.payload?.limit || 100 }), aliasFeed: job.payload?.aliasId ? materializeAliasFeed({ $i, aliasId: job.payload.aliasId, limit: job.payload?.limit || 100 }) : null };
    else if (job.type === 'notification.digest') result = await createNotificationDigest({ $i, aliasId: job.payload?.aliasId });
    else result = { noop: true, type: job.type };
    const done = { ...started, status:'done', result, finishedAt:Date.now() };
    put({ $i, shard:'audit', parts:['jobs', job.type, job.id], value: done, meta:{kind:'job', type:job.type, status:'done'} });
    return done;
  } catch (error) {
    const failed = { ...started, status:'failed', error: error.message, finishedAt:Date.now() };
    put({ $i, shard:'audit', parts:['jobs', job.type, job.id], value: failed, meta:{kind:'job', type:job.type, status:'failed'} });
    return failed;
  }
}
async function runQueuedJobs({ $i, limit = 10 }) { const jobs = queuedJobs($i, limit); const results = []; for (const job of jobs) results.push(await runJob({ $i, job })); return { ran: results.length, results }; }
async function createNotificationDigest({ $i, aliasId }) { const listed = await listNotifications({ $i, aliasId, includeRead:false }); let notes = listed.success || []; if (!notes.length) { notes = listPackedRecords({ $i, shard:'notify' }).filter(record => record.meta?.kind === 'notification' && record.value?.toAliasId === aliasId && !record.value?.read).map(record => record.value); } const digest = { id:`digest_${aliasId}_${Date.now()}`, aliasId, count:notes.length, notificationIds:notes.map(n=>n.id), createdAt:Date.now() }; put({ $i, shard:'notify', parts:['notificationDigests', aliasId, digest.id], value:digest, meta:{kind:'notificationDigest'} }); return digest; }
module.exports = { queuedJobs, runJob, runQueuedJobs, createNotificationDigest };
