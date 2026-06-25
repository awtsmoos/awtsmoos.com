// B"H
/** Chapter 614: The OS client learns universal object inspection routes. */
const KEY = 'awtsmoos_social_inbox_alias';
function clean(value) { return String(value || '').trim().replace(/[^\w:@.-]/g, '_').slice(0, 180); }
function alias() { return clean(localStorage.getItem(KEY) || localStorage.getItem('awtsmoosAlias') || window.awtsmoosAlias || ''); }
async function json(url) {
  const res = await fetch(url);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: { code: 'BAD_JSON', text } }; }
}
export const CivilizationOSClient = {
  alias,
  state() { return json('/api/social/civilization/state'); },
  feed(aliasId = alias()) { return aliasId ? json(`/api/social/civilization/feed/${encodeURIComponent(aliasId)}?limit=8`) : json('/api/social/civilization/events?limit=8'); },
  livingCard(aliasId = alias()) { return aliasId ? json(`/api/social/profiles/${encodeURIComponent(aliasId)}/living-card`) : Promise.resolve({ success: null }); },
  objectTypes() { return json('/api/social/objects/types'); },
  searchObjects(q = '', limit = 12) { return json(`/api/social/objects/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`); },
  inspectObject(type, id) { return json(`/api/social/objects/${encodeURIComponent(type)}/${encodeURIComponent(id)}/inspect`); }
};
