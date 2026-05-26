//B"H
/**
 * Real server + real DB write smoke.
 *
 * This script intentionally writes isolated BH_REAL_SMOKE_* data into the same
 * DosDB root used by index.js, then verifies the HTTP APIs can see/use it.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../ayzarim/DosDB/index.js');
const { createApiKey, verifyApiKey, hashKey } = require('../helper/apiKeys.js');
const packed = require('../helper/packed/socialPacked.js');

const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/real-server-writes');
const runSuffix = Date.now().toString(36);
const runId = `BH_REAL_SMOKE_${runSuffix}`;
const userId = `${runId}_USER`;
const userIdB = `${runId}_USER_B`;
const aliasId = `smoke_$${runSuffix}`;
const aliasIdB = `smokeb_$${runSuffix}`;
const heichelId = `smokeHeichel_$${runSuffix}`;
const postId = `smokePost_$${runSuffix}`;
const questionId = `smokeQuestion_$${runSuffix}`;
const answerId = `smokeAnswer_$${runSuffix}`;
const sectionId = `smokeSection_$${runSuffix}`;
const seriesId = 'root';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(route, { method = 'GET', body, apiKey } = {}) {
  const withApiKeyRoute = apiKey && method === 'GET'
    ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}`
    : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${withApiKeyRoute}`, {
    method,
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
      ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
    },
    body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}

function recentFilesSince(startMs) {
  const out = [];
  const skip = new Set(['.git', 'node_modules', '.awtsmoos']);
  function walk(dir, depth = 0) {
    if (depth > 8 || out.length > 80) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      let stat;
      try { stat = fs.statSync(full); } catch { continue; }
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (stat.mtimeMs >= startMs) out.push(full);
    }
  }
  walk(dbRoot);
  return out.map(file => path.relative(dbRoot, file)).sort();
}

async function requestWithRetry(route, options = {}, tries = 24) {
  let last;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await request(route, options);
    } catch (error) {
      last = error;
      await wait(250);
    }
  }
  throw last;
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before readiness with code ${server.exitCode}`);
    }
    try {
      const response = await request('/api/social/keys/verify?apiKey=probe');
      if (response.status === 200 || response.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready on 127.0.0.1:8080');
}

async function seedApiKey(seedUserId = userId) {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = {
    db,
    request: { user: { info: { userId: seedUserId } }, headers: {} },
    $_POST: { label: 'real server write smoke' }
  };
  const created = await createApiKey({ $i, userid: seedUserId });
  assert.ok(created.success?.key, 'API key should be created in real DB');
  await db.write(`/social/heichelos/${heichelId}/posts/${postId}`, {
    id: postId,
    title: 'Real smoke parent post',
    aliasId,
    heichelId,
    parentSeriesId: seriesId,
    content: 'Parent post fixture for real HTTP comment smoke.'
  });
  const direct = await verifyApiKey({ $i: { db, request: { headers: {} }, $_GET: { apiKey: created.success.key }, $_POST: {}, $_DELETE: {} } });
  assert.equal(direct.success?.userId, seedUserId, `direct helper verify failed: ${JSON.stringify(direct)}`);
  return { key: created.success.key, hash: hashKey(created.success.key), record: created.success.record };
}

async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const startedAt = Date.now();
  const seeded = await seedApiKey(userId);
  const seededB = await seedApiKey(userIdB);
  const apiKey = seeded.key;
  const apiKeyB = seededB.key;

  const server = spawn('node', ['index'], {
    cwd: repoRoot,
    stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')],
    env: { ...process.env, AWTSMOOS_REAL_SMOKE_DEBUG: '1' }
  });

  try {
    await waitForServer(server);

    const verify = await request('/api/social/keys/verify', { apiKey });
    assert.equal(verify.status, 200);
    assert.equal(verify.json?.success?.userId, userId, `verify response: ${JSON.stringify({ expectedUserId: userId, hash: seeded.hash, record: seeded.record, response: verify.json })}`);

    const alias = await request('/api/social/aliases', {
      method: 'POST',
      apiKey,
      body: {
        aliasName: `${runId} Alias`,
        inputId: aliasId,
        description: 'Real smoke alias written through HTTP token auth.'
      }
    });
    assert.equal(alias.status, 200, `alias response: ${alias.text}`);
    assert.ok(alias.json?.aliasId || alias.json?.success || alias.json?.id, `alias response: ${alias.text}`);

    const aliasB = await request('/api/social/aliases', {
      method: 'POST',
      apiKey: apiKeyB,
      body: {
        aliasName: `${runId} Alias B`,
        inputId: aliasIdB,
        description: 'Second real smoke alias written through HTTP token auth.'
      }
    });
    assert.equal(aliasB.status, 200, `aliasB response: ${aliasB.text}`);
    assert.ok(aliasB.json?.aliasId || aliasB.json?.success || aliasB.json?.id, `aliasB response: ${aliasB.text}`);

    const mail = await request(`/api/social/mail/sendTo/${encodeURIComponent(aliasIdB)}/from/${encodeURIComponent(aliasId)}`, {
      method: 'POST',
      apiKey,
      body: {
        subject: 'Real smoke chat',
        content: 'Hello from alias A to alias B through the social mail API.'
      }
    });
    assert.equal(mail.status, 200, `mail response: ${mail.text}`);
    assert.ok(mail.json?.success || mail.json?.message || mail.json?.sent || mail.json?.mailId, `mail response: ${mail.text}`);

    const note = await request(`/api/social/notifications/${encodeURIComponent(aliasIdB)}`, {
      method: 'POST',
      apiKey,
      body: {
        fromAliasId: aliasId,
        type: 'chat',
        title: 'New chat message',
        body: 'Alias A sent a real smoke message.',
        entity: JSON.stringify({ type: 'chat', from: aliasId, to: aliasIdB }),
        actionUrl: `/email/?to=${encodeURIComponent(aliasId)}`
      }
    });
    assert.equal(note.status, 200, `notification response: ${note.text}`);
    assert.equal(note.json?.success?.type, 'chat', `notification response: ${note.text}`);

    const noteList = await request(`/api/social/notifications/${encodeURIComponent(aliasIdB)}?includeRead=yes`, { apiKey: apiKeyB });
    assert.equal(noteList.status, 200, `notification list response: ${noteList.text}`);
    assert.ok(noteList.json?.success?.length >= 1, `notification list response: ${noteList.text}`);
    const notificationId = note.json.success.id;

    const noteRead = await request(`/api/social/notifications/${encodeURIComponent(aliasIdB)}/${encodeURIComponent(notificationId)}/read`, {
      method: 'POST',
      apiKey: apiKeyB,
      body: { aliasId: aliasIdB, notificationId }
    });
    assert.equal(noteRead.status, 200, `notification read response: ${noteRead.text}`);
    assert.equal(noteRead.json?.success?.read, true, `notification read response: ${noteRead.text}`);

    const graph = await request('/api/social/graph/references', {
      method: 'POST',
      apiKey,
      body: {
        kind: 'quotes',
        aliasId,
        fromType: 'post',
        fromId: postId,
        fromHeichelId: heichelId,
        fromSeriesId: seriesId,
        fromAliasId: aliasId,
        toType: 'comment',
        toId: `${runId}_COMMENT_TARGET`,
        toHeichelId: heichelId,
        toParentId: postId,
        toAliasId: aliasId,
        excerpt: 'Real graph quote written through HTTP.'
      }
    });
    assert.equal(graph.status, 200);
    assert.equal(graph.json?.success?.kind, 'quotes');

    const question = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/questions`, {
      method: 'POST',
      apiKey,
      body: {
        aliasId,
        postId: questionId,
        title: 'Real smoke question?',
        content: 'Question body created through the first-class question endpoint.',
        seriesId,
        sections: JSON.stringify([{ id: sectionId, title: 'Question section', content: 'Section content for independent comments/references.', dayuh: { nested: [{ a: [1, 2, { three: ['deep', 'busy'] }] }], more: { layers: { inside: { light: true } } } } }])
      }
    });
    assert.equal(question.status, 200, `question response: ${question.text}`);
    assert.equal(question.json?.success?.contentType, 'question', `question response: ${question.text}`);

    const answer = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`, {
      method: 'POST',
      apiKey,
      body: {
        aliasId,
        answerId,
        title: 'Real smoke answer',
        content: 'Answer body created through the first-class answer endpoint.',
        seriesId
      }
    });
    assert.equal(answer.status, 200, `answer response: ${answer.text}`);
    assert.equal(answer.json?.success?.contentType, 'answer', `answer response: ${answer.text}`);

    const answers = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`, { apiKey });
    assert.equal(answers.status, 200, `answers response: ${answers.text}`);
    assert.ok(Array.isArray(answers.json?.success), `answers response: ${answers.text}`);
    assert.ok(answers.json.success.some(item => item.kind === 'answers'), `answers response: ${answers.text}`);

    const extraSection = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(questionId)}/sections`, {
      method: 'POST',
      apiKey,
      body: {
        aliasId,
        sectionId: `${sectionId}_extra`,
        title: 'Extra section',
        content: 'Extra section created through the sections endpoint.'
      }
    });
    assert.equal(extraSection.status, 200, `section response: ${extraSection.text}`);
    assert.equal(extraSection.json?.success?.id, `${sectionId}_extra`);

    const sections = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(questionId)}/sections`, { apiKey });
    assert.equal(sections.status, 200, `sections response: ${sections.text}`);
    assert.ok(sections.json?.success?.length >= 2, `sections response: ${sections.text}`);

    const repost = await request('/api/social/content/repost', {
      method: 'POST',
      apiKey,
      body: {
        aliasId,
        fromType: 'comment',
        fromId: `${runId}_COMMENT_TARGET`,
        fromHeichelId: heichelId,
        fromParentId: postId,
        toType: 'question',
        toId: questionId,
        toHeichelId: heichelId,
        toSeriesId: seriesId,
        excerpt: 'Repost a comment toward a question.'
      }
    });
    assert.equal(repost.status, 200, `repost response: ${repost.text}`);
    assert.equal(repost.json?.success?.kind, 'reposts');

    const share = await request('/api/social/content/share', {
      method: 'POST',
      apiKey,
      body: {
        aliasId,
        fromType: 'section',
        fromId: `${sectionId}_extra`,
        fromHeichelId: heichelId,
        fromParentId: questionId,
        fromSectionId: `${sectionId}_extra`,
        toType: 'answer',
        toId: answerId,
        toHeichelId: heichelId,
        toSeriesId: seriesId,
        excerpt: 'Share a section toward an answer.'
      }
    });
    assert.equal(share.status, 200, `share response: ${share.text}`);
    assert.equal(share.json?.success?.kind, 'crossLinks');

    const comment = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/post/${encodeURIComponent(postId)}/comments/aliases/${encodeURIComponent(aliasId)}`, {
      method: 'POST',
      apiKey,
      body: {
        seriesId,
        content: 'Real submitted comment written through HTTP token auth.',
        dayuh: JSON.stringify({ verseSection: 'root', smoke: runId })
      }
    });
    assert.equal(comment.status, 200);
    assert.ok(comment.json?.success || comment.json?.message || comment.json?.error === undefined, `comment response: ${comment.text}`);

    const dryMigration = await request(`/api/social/packed/migrations/posts/v2/dryRun?heichelId=${encodeURIComponent(heichelId)}&seriesId=${encodeURIComponent(seriesId)}`, { apiKey });
    assert.equal(dryMigration.status, 200, `dry migration response: ${dryMigration.text}`);

    const runMigration = await request(`/api/social/packed/migrations/posts/v2/run?heichelId=${encodeURIComponent(heichelId)}&seriesId=${encodeURIComponent(seriesId)}`, {
      method: 'POST',
      apiKey,
      body: { heichelId, seriesId, limit: '20' }
    });
    assert.equal(runMigration.status, 200, `run migration response: ${runMigration.text}`);

    const packedStats = await request('/api/social/packed/stats', { apiKey });
    assert.equal(packedStats.status, 200, `packed stats response: ${packedStats.text}`);
    const stats = packedStats.json?.success || [];
    assert.ok(stats.some(item => item.shard === 'core' && item.records >= 1), `packed stats: ${packedStats.text}`);
    assert.ok(stats.some(item => item.shard === 'graph' && item.records >= 1), `packed stats: ${packedStats.text}`);
    assert.ok(stats.some(item => item.shard === 'notify' && item.records >= 1), `packed stats: ${packedStats.text}`);
    assert.ok(stats.some(item => item.shard === 'audit' && item.records >= 1), `packed stats: ${packedStats.text}`);

    const packedRecords = packed.listPackedRecords({ $i: { db: { directory: dbRoot } }, shard: 'core' });
    assert.ok(packedRecords.some(record => record.recordType === 'jsonBusyObject' || record.meta?.complexity?.maxDepth >= 4), 'Expected at least one busy JSON packed record');

    const packedSnapshot = await request('/api/social/packed/snapshot', { apiKey });
    assert.equal(packedSnapshot.status, 200, `packed snapshot response: ${packedSnapshot.text}`);
    assert.ok(packedSnapshot.json?.success?.manifests >= 1, `packed snapshot response: ${packedSnapshot.text}`);
    assert.ok(packedSnapshot.json?.success?.indexStats?.records >= 1, `packed snapshot response: ${packedSnapshot.text}`);

    const packedIntegrity = await request('/api/social/packed/integrity', { apiKey });
    assert.equal(packedIntegrity.status, 200, `packed integrity response: ${packedIntegrity.text}`);
    assert.ok(Array.isArray(packedIntegrity.json?.success?.missingPostManifests), `packed integrity response: ${packedIntegrity.text}`);

    const packedRepair = await request('/api/social/packed/repair/posts/manifests?limit=25', {
      method: 'POST',
      apiKey,
      body: { limit: '25' }
    });
    assert.equal(packedRepair.status, 200, `packed repair response: ${packedRepair.text}`);
    assert.ok(Number.isInteger(packedRepair.json?.success?.repaired), `packed repair response: ${packedRepair.text}`);

    const searchRecords = packed.listPackedRecords({ $i: { db: { directory: dbRoot } }, shard: 'search' });
    assert.ok(searchRecords.some(record => record.meta?.index === 'postsByHeichel'), 'Expected postsByHeichel packed search index');
    assert.ok(searchRecords.some(record => record.meta?.index === 'graphOut'), 'Expected graphOut packed search index');

    const auditRecords = packed.listPackedRecords({ $i: { db: { directory: dbRoot } }, shard: 'audit' });
    assert.ok(auditRecords.some(record => record.meta?.kind === 'socialEvent'), 'Expected social event audit records');
    assert.ok(auditRecords.some(record => record.meta?.kind === 'migrationManifest'), 'Expected migration manifest audit records');

    const packedKeys = await request('/api/social/packed/keys?shard=core&prefix=/posts', { apiKey });
    assert.equal(packedKeys.status, 200, `packed keys response: ${packedKeys.text}`);
    assert.ok(Array.isArray(packedKeys.json?.success), `packed keys response: ${packedKeys.text}`);

    const packedRead = await request(`/api/social/packed/read?shard=core&key=${encodeURIComponent(`/posts/${heichelId}/${questionId}`)}`, { apiKey });
    assert.equal(packedRead.status, 200, `packed read response: ${packedRead.text}`);
    assert.equal(packedRead.json?.success?.value?.id, questionId, `packed read response: ${packedRead.text}`);

    const packedFeed = await request('/api/social/packed/feed/materialize', {
      method: 'POST',
      apiKey,
      body: { heichelId, aliasId, limit: '50' }
    });
    assert.equal(packedFeed.status, 200, `packed feed response: ${packedFeed.text}`);
    assert.ok(packedFeed.json?.success?.heichelFeed?.items?.length >= 1, `packed feed response: ${packedFeed.text}`);

    const packedCompact = await request('/api/social/packed/compact', {
      method: 'POST',
      apiKey,
      body: { shard: 'core' }
    });
    assert.equal(packedCompact.status, 200, `packed compact response: ${packedCompact.text}`);
    assert.ok(Number.isInteger(packedCompact.json?.success?.after), `packed compact response: ${packedCompact.text}`);

    const platformLiveSub = await request('/api/social/live/subscribe', {
      method: 'POST', apiKey, body: { aliasId, channel: heichelId }
    });
    assert.equal(platformLiveSub.status, 200, `live subscribe response: ${platformLiveSub.text}`);

    const platformPresence = await request('/api/social/live/presence', {
      method: 'POST', apiKey, body: { aliasId, channel: heichelId, status: 'typing' }
    });
    assert.equal(platformPresence.status, 200, `live presence response: ${platformPresence.text}`);

    const platformPublish = await request('/api/social/live/publish', {
      method: 'POST', apiKey, body: { channel: heichelId, type: 'graph', actor: aliasId, payload: JSON.stringify({ questionId }) }
    });
    assert.equal(platformPublish.status, 200, `live publish response: ${platformPublish.text}`);

    const platformReplay = await request(`/api/social/live/replay?channel=${encodeURIComponent(heichelId)}&since=0`, { apiKey });
    assert.equal(platformReplay.status, 200, `live replay response: ${platformReplay.text}`);
    assert.ok(platformReplay.json?.success?.length >= 1, `live replay response: ${platformReplay.text}`);

    const platformRateLimit = await request('/api/social/abuse/rateLimit/check', {
      method: 'POST', apiKey, body: { subject: aliasId, bucket: 'realSmoke', limit: '3', cost: '1' }
    });
    assert.equal(platformRateLimit.status, 200, `rate response: ${platformRateLimit.text}`);
    assert.equal(platformRateLimit.json?.success?.allowed, true, `rate response: ${platformRateLimit.text}`);

    const platformSearchIndex = await request('/api/social/search/index', {
      method: 'POST', apiKey, body: { domain: 'post', id: questionId, text: 'awtsmoos smoke searchable question graph', entity: JSON.stringify({ type: 'question', id: questionId }) }
    });
    assert.equal(platformSearchIndex.status, 200, `search index response: ${platformSearchIndex.text}`);

    const platformSearch = await request('/api/social/search/query?q=searchable%20graph&domain=post', { apiKey });
    assert.equal(platformSearch.status, 200, `search response: ${platformSearch.text}`);
    assert.ok(platformSearch.json?.success?.some(item => item.id === questionId), `search response: ${platformSearch.text}`);

    const relationship = await request(`/api/social/relationships/${encodeURIComponent(aliasId)}/follow/${encodeURIComponent(aliasIdB)}`, {
      method: 'POST', apiKey, body: {}
    });
    assert.equal(relationship.status, 200, `relationship response: ${relationship.text}`);
    assert.equal(relationship.json?.success?.type, 'follow', `relationship response: ${relationship.text}`);

    const media = await request('/api/social/media/register', {
      method: 'POST', apiKey, body: { mediaId: `${runId}_media`, aliasId, metadata: JSON.stringify({ mime: 'image/png', bytes: 123 }) }
    });
    assert.equal(media.status, 200, `media response: ${media.text}`);

    const mediaAttach = await request('/api/social/media/attach', {
      method: 'POST', apiKey, body: { mediaId: `${runId}_media`, entity: JSON.stringify({ type: 'question', id: questionId }) }
    });
    assert.equal(mediaAttach.status, 200, `media attach response: ${mediaAttach.text}`);

    const moderation = await request('/api/social/mod/reports', {
      method: 'POST', apiKey, body: { actor: aliasIdB, target: JSON.stringify({ type: 'question', id: questionId }), reason: 'real smoke report' }
    });
    assert.equal(moderation.status, 200, `moderation response: ${moderation.text}`);

    const job = await request('/api/social/jobs/enqueue', {
      method: 'POST', apiKey, body: { type: 'compact', payload: JSON.stringify({ shard: 'core' }) }
    });
    assert.equal(job.status, 200, `job response: ${job.text}`);

    const metric = await request('/api/social/analytics/metric', {
      method: 'POST', apiKey, body: { name: 'realSmoke.platform', value: '1', tags: JSON.stringify({ heichelId }) }
    });
    assert.equal(metric.status, 200, `metric response: ${metric.text}`);

    const cache = await request('/api/social/cache/set', {
      method: 'POST', apiKey, body: { key: `${runId}:feed`, value: JSON.stringify({ questionId }), ttlMs: '60000' }
    });
    assert.equal(cache.status, 200, `cache response: ${cache.text}`);

    const sync = await request('/api/social/sync/op', {
      method: 'POST', apiKey, body: { aliasId, op: 'draft.save', payload: JSON.stringify({ questionId }) }
    });
    assert.equal(sync.status, 200, `sync response: ${sync.text}`);

    const permission = await request('/api/social/permissions/compile', {
      method: 'POST', apiKey, body: { subject: aliasId, resource: heichelId, rules: JSON.stringify({ allow: true, canPost: true }) }
    });
    assert.equal(permission.status, 200, `permission response: ${permission.text}`);

    const federation = await request('/api/social/federation/import', {
      method: 'POST', apiKey, body: { remoteHeichel: `${heichelId}_remote`, signedPayload: JSON.stringify({ sig: 'demo', questionId }) }
    });
    assert.equal(federation.status, 200, `federation response: ${federation.text}`);

    const graphTransaction = await request('/api/social/graph/transaction', {
      method: 'POST',
      apiKey,
      body: {
        actor: aliasId,
        edges: JSON.stringify([
          { kind: 'references', from: { type: 'question', id: questionId, heichelId }, to: { type: 'answer', id: answerId, heichelId } }
        ])
      }
    });
    assert.equal(graphTransaction.status, 200, `graph transaction response: ${graphTransaction.text}`);
    assert.equal(graphTransaction.json?.success?.status, 'committed', `graph transaction response: ${graphTransaction.text}`);

    const badGraphTransaction = await request('/api/social/graph/transaction', {
      method: 'POST',
      apiKey,
      body: { actor: aliasId, edges: JSON.stringify([{ kind: 'references', from: { type: 'post' }, to: { type: 'answer', id: answerId } }]) }
    });
    assert.equal(badGraphTransaction.status, 200, `bad graph transaction response: ${badGraphTransaction.text}`);
    assert.equal(badGraphTransaction.json?.error?.code, 'GRAPH_TRANSACTION_REJECTED', `bad graph transaction response: ${badGraphTransaction.text}`);

    const digest = await request(`/api/social/notifications/digest/${encodeURIComponent(aliasIdB)}`, {
      method: 'POST', apiKey: apiKeyB, body: {}
    });
    assert.equal(digest.status, 200, `digest response: ${digest.text}`);
    assert.ok(Number.isInteger(digest.json?.success?.count), `digest response: ${digest.text}`);

    const runJobs = await request('/api/social/jobs/run', {
      method: 'POST', apiKey, body: { limit: '5' }
    });
    assert.equal(runJobs.status, 200, `run jobs response: ${runJobs.text}`);
    assert.ok(Number.isInteger(runJobs.json?.success?.ran), `run jobs response: ${runJobs.text}`);

    const cacheGet = await request(`/api/social/cache/get?key=${encodeURIComponent(`${runId}:feed`)}`, { apiKey });
    assert.equal(cacheGet.status, 200, `cache get response: ${cacheGet.text}`);
    assert.equal(cacheGet.json?.success?.key, `${runId}:feed`, `cache get response: ${cacheGet.text}`);

    const cacheInvalidate = await request('/api/social/cache/invalidate', {
      method: 'POST', apiKey, body: { key: `${runId}:feed` }
    });
    assert.equal(cacheInvalidate.status, 200, `cache invalidate response: ${cacheInvalidate.text}`);
    assert.equal(cacheInvalidate.json?.success?.invalidated, true, `cache invalidate response: ${cacheInvalidate.text}`);

    const syncPull = await request(`/api/social/sync/pull/${encodeURIComponent(aliasId)}?since=0`, { apiKey });
    assert.equal(syncPull.status, 200, `sync pull response: ${syncPull.text}`);
    assert.ok(syncPull.json?.success?.length >= 1, `sync pull response: ${syncPull.text}`);

    const feedHome = await request(`/api/social/feed/home?aliasId=${encodeURIComponent(aliasId)}`, { apiKey });
    assert.equal(feedHome.status, 200, `feed home response: ${feedHome.text}`);
    assert.ok(Array.isArray(feedHome.json?.success?.items), `feed home response: ${feedHome.text}`);

    const feedHeichel = await request(`/api/social/feed/heichel/${encodeURIComponent(heichelId)}`, { apiKey });
    assert.equal(feedHeichel.status, 200, `feed heichel response: ${feedHeichel.text}`);
    assert.ok(feedHeichel.json?.success?.items?.length >= 1, `feed heichel response: ${feedHeichel.text}`);

    const feedTrending = await request('/api/social/feed/trending', { apiKey });
    assert.equal(feedTrending.status, 200, `feed trending response: ${feedTrending.text}`);
    assert.ok(Array.isArray(feedTrending.json?.success?.items), `feed trending response: ${feedTrending.text}`);

    const feedDiscover = await request('/api/social/feed/discover', { apiKey });
    assert.equal(feedDiscover.status, 200, `feed discover response: ${feedDiscover.text}`);
    assert.ok(Array.isArray(feedDiscover.json?.success?.items), `feed discover response: ${feedDiscover.text}`);

    const threadRoot = await request('/api/social/comments/thread/append', {
      method: 'POST', apiKey, body: { postId: questionId, commentId: `${runId}_thread_root`, aliasId, content: 'Thread root' }
    });
    assert.equal(threadRoot.status, 200, `thread root response: ${threadRoot.text}`);

    const threadReply = await request('/api/social/comments/thread/append', {
      method: 'POST', apiKey: apiKeyB, body: { postId: questionId, commentId: `${runId}_thread_reply`, parentId: `${runId}_thread_root`, aliasId: aliasIdB, content: 'Thread reply' }
    });
    assert.equal(threadReply.status, 200, `thread reply response: ${threadReply.text}`);

    const rankedThread = await request(`/api/social/comments/thread/${encodeURIComponent(questionId)}/ranked`, { apiKey });
    assert.equal(rankedThread.status, 200, `ranked thread response: ${rankedThread.text}`);
    assert.equal(rankedThread.json?.success?.comments?.[0]?.commentId, `${runId}_thread_root`, `ranked thread response: ${rankedThread.text}`);

    const files = recentFilesSince(startedAt).filter(file => /social|apiKeys|graph|aliases|comments/i.test(file)).slice(0, 40);
    assert.ok(files.length > 0, 'Expected real DB files to change');

    console.log('B"H realServerWrites.test passed', JSON.stringify({
      dbRoot,
      userId,
      aliasId,
      heichelId,
      postId,
      apiKeyVerified: verify.json.success.userId,
      userIdB,
      aliasResponse: alias.json,
      aliasBResponse: aliasB.json,
      mailResponse: mail.json,
      notificationId,
      notificationRead: noteRead.json.success.read,
      graphReferenceId: graph.json.success.id,
      questionId,
      answerId,
      sectionId,
      answerLinks: answers.json.success.length,
      sections: sections.json.success.length,
      repostId: repost.json.success.id,
      shareId: share.json.success.id,
      commentResponse: comment.json,
      packedStats: stats,
      packedSnapshot: packedSnapshot.json.success,
      packedIntegrity: packedIntegrity.json.success,
      packedRepair: packedRepair.json.success,
      platform: {
        liveEvents: platformReplay.json.success.length,
        searchHits: platformSearch.json.success.length,
        relationship: relationship.json.success.type,
        jobId: job.json.success.id,
        moderationId: moderation.json.success.id,
        graphTransaction: graphTransaction.json.success.status,
        jobsRan: runJobs.json.success.ran,
        digestCount: digest.json.success.count,
        rankedThreadTop: rankedThread.json.success.comments[0].commentId
      },
      packedShardFiles: fs.existsSync(path.join(dbRoot, 'socialPacked')) ? fs.readdirSync(path.join(dbRoot, 'socialPacked')).sort() : [],
      changedFiles: files
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
