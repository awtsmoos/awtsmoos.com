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

export async function searchSocial({ q, domain = '' } = {}) {
  return await AwtsmoosRequest.fetch(api(`search/query?${new URLSearchParams({ q: q || '', domain })}`));
}

export async function publishLiveEvent({ channel, type = 'ui', actor = '', payload = {} } = {}) {
  return await AwtsmoosRequest.post(api('live/publish'), body({ channel, type, actor, payload: JSON.stringify(payload) }));
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

export async function checkRateLimit({ subject, bucket = 'ui', limit = 120, cost = 1 } = {}) {
  return await AwtsmoosRequest.post(api('abuse/rateLimit/check'), body({ subject, bucket, limit, cost }));
}

export async function materializeFeed({ heichelId, aliasId = '', limit = 20 } = {}) {
  return await AwtsmoosRequest.post(api('packed/feed/materialize'), body({ heichelId, aliasId, limit }));
}
