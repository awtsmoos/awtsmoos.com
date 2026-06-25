// B"H
/**
 * Chapter 557: A tiny client drinks from canonical `/api/social/civilization`
 * without inventing identity, auth, or another social namespace.
 */
const KEY = 'awtsmoos_social_inbox_alias';
function clean(value) { return String(value || '').trim().replace(/[^\w:@.-]/g, '_').slice(0, 180); }
function alias() { return clean(localStorage.getItem(KEY) || localStorage.getItem('awtsmoosAlias') || window.awtsmoosAlias || ''); }
async function json(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: { code: 'BAD_JSON', text } }; }
}
export const CivilizationClient = {
  alias,
  state() { return json('/api/social/civilization/state'); },
  events(limit = 25) { return json(`/api/social/civilization/events?limit=${encodeURIComponent(limit)}`); },
  feed(aliasId = alias(), limit = 25) {
    return aliasId ? json(`/api/social/civilization/feed/${encodeURIComponent(aliasId)}?limit=${encodeURIComponent(limit)}`) : Promise.resolve({ success: [] });
  },
  livingCard(aliasId = alias()) {
    return aliasId ? json(`/api/social/profiles/${encodeURIComponent(aliasId)}/living-card`) : Promise.resolve({ success: null });
  }
};
