//B"H
/**
 * @module PlatformAPI
 * @description Browser helpers for live/feed/search/sync/packed platform routes.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';

const api = path => `${BASE_API_URL}${path.replace(/^\/+/, '')}`;
const body = value => new URLSearchParams(value);

export async function getFeedHome({ aliasId = '', limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`feed/home?${new URLSearchParams({ aliasId, limit })}`));
}

export async function getHeichelFeed({ heichelId, limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`feed/heichel/${encodeURIComponent(heichelId)}?${new URLSearchParams({ limit })}`));
}

export async function getTrendingFeed({ limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`feed/trending?${new URLSearchParams({ limit })}`));
}

export async function getDiscoverFeed({ limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`feed/discover?${new URLSearchParams({ limit })}`));
}

export async function searchSocial({ q, domain = '' } = {}) {
  return await AwtsmoosRequest.fetch(api(`search/query?${new URLSearchParams({ q: q || '', domain })}`));
}

export async function indexSearchDocument({ domain = 'post', id, text = '', entity = {} } = {}) {
  return await AwtsmoosRequest.post(api('search/index'), body({ domain, id, text, entity: JSON.stringify(entity) }));
}

export async function publishLiveEvent({ channel, type = 'ui', actor = '', payload = {} } = {}) {
  return await AwtsmoosRequest.post(api('live/publish'), body({ channel, type, actor, payload: JSON.stringify(payload) }));
}

export async function subscribeLiveChannel({ aliasId, channel } = {}) {
  return await AwtsmoosRequest.post(api('live/subscribe'), body({ aliasId, channel }));
}

export async function setLivePresence({ aliasId, channel, status = 'online' } = {}) {
  return await AwtsmoosRequest.post(api('live/presence'), body({ aliasId, channel, status }));
}

export async function replayLiveEvents({ channel, since = 0, limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`live/replay?${new URLSearchParams({ channel, since, limit })}`));
}

export async function getPackedStats() {
  return await AwtsmoosRequest.fetch(api('packed/stats'));
}

export async function getPackedSnapshot() {
  return await AwtsmoosRequest.fetch(api('packed/snapshot'));
}

export async function pullSync({ aliasId, since = 0, limit = 20 } = {}) {
  return await AwtsmoosRequest.fetch(api(`sync/pull/${encodeURIComponent(aliasId)}?${new URLSearchParams({ since, limit })}`));
}

export async function getCache({ key } = {}) {
  return await AwtsmoosRequest.fetch(api(`cache/get?${new URLSearchParams({ key: key || '' })}`));
}

export async function setCache({ key, value = {}, ttlMs = 60000 } = {}) {
  return await AwtsmoosRequest.post(api('cache/set'), body({ key, value: JSON.stringify(value), ttlMs }));
}

export async function invalidateCache({ key } = {}) {
  return await AwtsmoosRequest.post(api('cache/invalidate'), body({ key }));
}

export async function pushSyncOp({ aliasId, op = 'ui.sync', payload = {} } = {}) {
  return await AwtsmoosRequest.post(api('sync/op'), body({ aliasId, op, payload: JSON.stringify(payload) }));
}

export async function checkRateLimit({ subject, bucket = 'ui', limit = 120, cost = 1 } = {}) {
  return await AwtsmoosRequest.post(api('abuse/rateLimit/check'), body({ subject, bucket, limit, cost }));
}

export async function materializeFeed({ heichelId, aliasId = '', limit = 20 } = {}) {
  return await AwtsmoosRequest.post(api('packed/feed/materialize'), body({ heichelId, aliasId, limit }));
}

export async function runGraphTransaction({ actor = '', edges = [] } = {}) {
  return await AwtsmoosRequest.post(api('graph/transaction'), body({ actor, edges: JSON.stringify(edges) }));
}

export async function listGraphTransactions() {
  return await AwtsmoosRequest.fetch(api('graph/transaction'));
}

export async function createNotificationDigest({ aliasId } = {}) {
  return await AwtsmoosRequest.post(api(`notifications/digest/${encodeURIComponent(aliasId)}`), body({}));
}

export async function appendThreadComment({ postId, commentId, parentId = '', aliasId = '', content = '' } = {}) {
  return await AwtsmoosRequest.post(api('comments/thread/append'), body({ postId, commentId, parentId, aliasId, content }));
}

export async function getRankedThread({ postId } = {}) {
  return await AwtsmoosRequest.fetch(api(`comments/thread/${encodeURIComponent(postId)}/ranked`));
}
