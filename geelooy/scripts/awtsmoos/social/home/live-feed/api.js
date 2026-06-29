// B"H
import {
  getFeedHome,
  getTrendingFeed,
  getDiscoverFeed,
  searchSocial
} from '/heichelos/heichel/modules/api/platform.js';
import { AwtsmoosRequest, BASE_API_URL } from '/heichelos/heichel/modules/api/base.js';

const api = path => `${BASE_API_URL}${path.replace(/^\/+/, '')}`;

export async function loadFeedMode(mode, { query = '', aliasId = currentAlias() } = {}) {
  const loaders = {
    forYou: () => getFeedHome({ aliasId, limit: 14 }),
    following: () => getDiscoverFeed({ limit: 14 }),
    trending: () => getTrendingFeed({ limit: 14 }),
    civilization: () => getCivilizationFeed({ aliasId, limit: 18 }),
    search: () => searchSocial({ q: query || '', domain: '' })
  };
  return await (loaders[mode] || loaders.forYou)();
}

export async function getCivilizationFeed({ aliasId = currentAlias(), limit = 18 } = {}) {
  const qs = new URLSearchParams({ limit });
  return await AwtsmoosRequest.fetch(api(`civilization/feed/${encodeURIComponent(aliasId || 'anonymous')}?${qs}`));
}

export async function getCivilizationState() {
  return await AwtsmoosRequest.fetch(api('civilization/state'));
}

export async function getCivilizationEntityState({ type, id } = {}) {
  const t = encodeURIComponent(type || 'object');
  const key = encodeURIComponent(id || 'unknown');
  return await AwtsmoosRequest.fetch(api(`civilization/entities/${t}/${key}/state`));
}

export function currentAlias() {
  return window.curAlias || window.currentAlias || document.body?.dataset?.aliasId || 'anonymous';
}

/**
 * B"H
 * The missing named exports no longer shatter the whole module. The home page
 * touches civilization routes through a focused fallback vessel.
 */
