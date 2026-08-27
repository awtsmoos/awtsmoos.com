// B"H
/**
 * @file inbox-client.js
 * @description Chapter 542: Code sessions drink from the same inbox river as
 * the Virtual OS, but this vessel has no UI opinions and no auth invention.
 */

const KEY = 'awtsmoos_social_inbox_alias';

function cleanAlias(aliasId) {
  return String(aliasId || '').trim().replace(/[^a-zA-Z0-9_:@.-]/g, '_').slice(0, 180);
}

function readStoredAlias() {
  return cleanAlias(localStorage.getItem(KEY) || localStorage.getItem('awtsmoosAlias') || '');
}

async function json(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: { code: 'BAD_JSON', text } }; }
}

function root(aliasId) {
  const alias = cleanAlias(aliasId || readStoredAlias());
  if (!alias) throw new Error('Missing social inbox alias.');
  return `/api/social/communications/${encodeURIComponent(alias)}`;
}

export const SocialInboxClient = {
  setAlias(aliasId) {
    const alias = cleanAlias(aliasId);
    if (alias) localStorage.setItem(KEY, alias);
    return alias;
  },
  getAlias: readStoredAlias,
  overview(aliasId) { return json(`${root(aliasId)}/overview`); },
  list(aliasId, limit = 25) { return json(`${root(aliasId)}/inbox?limit=${encodeURIComponent(limit)}`); },
  unread(aliasId) { return json(`${root(aliasId)}/inbox/unread`); },
  thread(aliasId, threadId, limit = 50) {
    return json(`${root(aliasId)}/threads/${encodeURIComponent(String(threadId || ''))}?limit=${encodeURIComponent(limit)}`);
  },
  markRead(aliasId, itemId) {
    return json(`${root(aliasId)}/inbox/${encodeURIComponent(String(itemId || ''))}/read`, { method: 'POST' });
  }
};

window.AwtsmoosCodeSocialInbox = SocialInboxClient;
