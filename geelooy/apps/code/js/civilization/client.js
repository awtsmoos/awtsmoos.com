// B"H
/** Chapter 602: The civilization client learns universal object routes. */
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
  feed(aliasId = alias(), limit = 25) { return aliasId ? json(`/api/social/civilization/feed/${encodeURIComponent(aliasId)}?limit=${encodeURIComponent(limit)}`) : Promise.resolve({ success: [] }); },
  livingCard(aliasId = alias()) { return aliasId ? json(`/api/social/profiles/${encodeURIComponent(aliasId)}/living-card`) : Promise.resolve({ success: null }); },
  objectTypes() { return json('/api/social/objects/types'); },
  objects(q = '', limit = 25) { return json(`/api/social/objects/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`); },
  inspectObject(type, id) { return json(`/api/social/objects/${encodeURIComponent(type)}/${encodeURIComponent(id)}/inspect`); },
  objectCard(type, id) { return json(`/api/social/objects/${encodeURIComponent(type)}/${encodeURIComponent(id)}/card`); },
  objectTimeline(type, id) { return json(`/api/social/objects/${encodeURIComponent(type)}/${encodeURIComponent(id)}/timeline`); },
  objectRelationships(type, id) { return json(`/api/social/objects/${encodeURIComponent(type)}/${encodeURIComponent(id)}/relationships`); }
};
