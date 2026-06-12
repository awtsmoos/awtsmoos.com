//B"H
/**
 * @module PlatformPackedGates
 * @description Graph lightning, packed oceans, feeds, jobs, cache, and live echoes.
 */
import assert from 'node:assert/strict';
import { request } from './server.mjs';
import { okResponse, expectError, arrayish, containsDeep, logGate } from './assertions.mjs';

export async function runPlatformGates(ctx) {
  logGate('8 graph references and platform');
  okResponse(await request('/api/social/graph/references', { method: 'POST', apiKey: ctx.apiKey, body: { kind: 'references', aliasId: ctx.aliasA, fromType: 'post', fromId: ctx.postId, fromHeichelId: ctx.heichelId, fromSeriesId: ctx.seriesA, toType: 'comment', toId: ctx.commentId, toHeichelId: ctx.heichelId, toParentId: ctx.postId, toAliasId: ctx.aliasA, excerpt: 'post references comment' } }), 'graph reference');
  okResponse(await request('/api/social/graph/transaction', { method: 'POST', apiKey: ctx.apiKey, body: { actor: ctx.aliasA, edges: JSON.stringify([{ kind: 'references', from: { type: 'post', id: ctx.postId, heichelId: ctx.heichelId }, to: { type: 'answer', id: ctx.answerId, heichelId: ctx.heichelId } }]) } }), 'graph transaction good');
  const badGraph = expectError(await request('/api/social/graph/transaction', { method: 'POST', apiKey: ctx.apiKey, body: { actor: ctx.aliasA, edges: JSON.stringify([{ kind: 'references', from: { type: 'post' }, to: { type: 'answer', id: ctx.answerId } }]) } }), 'graph transaction bad');
  assert.equal(badGraph.error?.code, 'GRAPH_TRANSACTION_REJECTED');
  okResponse(await request(`/api/social/relationships/${ctx.aliasA}/follow/${ctx.aliasB}`, { method: 'POST', apiKey: ctx.apiKey, body: {} }), 'follow');
  okResponse(await request('/api/social/live/subscribe', { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, channel: ctx.heichelId } }), 'live subscribe');
  okResponse(await request('/api/social/live/publish', { method: 'POST', apiKey: ctx.apiKey, body: { channel: ctx.heichelId, type: 'stress', actor: ctx.aliasA, payload: JSON.stringify({ postId: ctx.postId }) } }), 'live publish');
  const replay = okResponse(await request(`/api/social/live/replay?channel=${ctx.heichelId}&since=0`, { apiKey: ctx.apiKey }), 'live replay');
  assert.ok(arrayish(replay.success).length >= 1, 'live replay should include event');
  okResponse(await request('/api/social/media/register', { method: 'POST', apiKey: ctx.apiKey, body: { mediaId: `${ctx.runId}_media`, aliasId: ctx.aliasA, metadata: JSON.stringify({ mime: 'image/png', bytes: 321 }) } }), 'media register');
  okResponse(await request('/api/social/media/attach', { method: 'POST', apiKey: ctx.apiKey, body: { mediaId: `${ctx.runId}_media`, entity: JSON.stringify({ type: 'post', id: ctx.postId }) } }), 'media attach');
  okResponse(await request('/api/social/mod/reports', { method: 'POST', apiKey: ctx.apiKeyB, body: { actor: ctx.aliasB, target: JSON.stringify({ type: 'post', id: ctx.postId }), reason: 'stress moderation' } }), 'moderation report');
  okResponse(await request('/api/social/cache/set', { method: 'POST', apiKey: ctx.apiKey, body: { key: `${ctx.runId}:cache`, value: JSON.stringify({ postId: ctx.postId }), ttlMs: '60000' } }), 'cache set');
  okResponse(await request(`/api/social/cache/get?key=${encodeURIComponent(`${ctx.runId}:cache`)}`, { apiKey: ctx.apiKey }), 'cache get');
  okResponse(await request('/api/social/cache/invalidate', { method: 'POST', apiKey: ctx.apiKey, body: { key: `${ctx.runId}:cache` } }), 'cache invalidate');
  okResponse(await request('/api/social/jobs/enqueue', { method: 'POST', apiKey: ctx.apiKey, body: { type: 'stress', payload: JSON.stringify({ runId: ctx.runId }) } }), 'job enqueue');
  okResponse(await request('/api/social/jobs/run', { method: 'POST', apiKey: ctx.apiKey, body: { limit: '5' } }), 'jobs run');
  okResponse(await request('/api/social/search/index', { method: 'POST', apiKey: ctx.apiKey, body: { domain: 'post', id: ctx.postId, text: `full lifecycle searchable ${ctx.runId}`, entity: JSON.stringify({ type: 'post', id: ctx.postId }) } }), 'search index');
  const search = okResponse(await request(`/api/social/search/query?q=${encodeURIComponent(ctx.runId)}&domain=post`, { apiKey: ctx.apiKey }), 'search query');
  assert.ok(containsDeep(search, ctx.postId), 'search should include indexed post');

  logGate('9 packed huge shard bounded');
  okResponse(await request(`/api/social/packed/migrations/posts/v2/dryRun?heichelId=${ctx.heichelId}&seriesId=${ctx.seriesA}`, { apiKey: ctx.apiKey }), 'packed migration dry');
  okResponse(await request(`/api/social/packed/migrations/posts/v2/run?heichelId=${ctx.heichelId}&seriesId=${ctx.seriesA}`, { method: 'POST', apiKey: ctx.apiKey, body: { heichelId: ctx.heichelId, seriesId: ctx.seriesA, limit: '30' } }), 'packed migration run');
  okResponse(await request('/api/social/packed/stats', { apiKey: ctx.apiKey }), 'packed stats');
  okResponse(await request('/api/social/packed/keys?shard=core&prefix=/posts&limit=20', { apiKey: ctx.apiKey }), 'packed keys bounded');
  okResponse(await request(`/api/social/packed/read?shard=core&key=${encodeURIComponent(`/posts/${ctx.heichelId}/${ctx.questionId}`)}`, { apiKey: ctx.apiKey }), 'packed read question');
  okResponse(await request('/api/social/packed/snapshot', { apiKey: ctx.apiKey }), 'packed snapshot');
  okResponse(await request('/api/social/packed/integrity', { apiKey: ctx.apiKey }), 'packed integrity');
  okResponse(await request('/api/social/packed/repair/posts/manifests?limit=25', { method: 'POST', apiKey: ctx.apiKey, body: { limit: '25' } }), 'packed repair');
  okResponse(await request('/api/social/packed/compact', { method: 'POST', apiKey: ctx.apiKey, body: { shard: 'core' } }), 'packed compact');

  logGate('10 failure cleanup probes');
  expectError(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/posts`, { method: 'POST', apiKey: ctx.apiKey, body: { title: 'missing alias', content: 'bad' } }), 'bad post missing alias');
  expectError(await request(`/api/social/heichelos/${ctx.heichelId}/comment/${ctx.commentId}`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, parentType: 'post', parentId: ctx.postId, seriesId: ctx.seriesA, verseSection: 'root' } }), 'bad comment edit missing content');
}
