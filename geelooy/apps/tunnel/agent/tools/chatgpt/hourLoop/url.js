// B"H

/**
 * B"H
 * Chapter 1969: A custom GPT conversation reveals its true id.
 *
 * Both /c/<id> and /g/<gpt>/c/<id> paths become the durable conversation key.
 */
function normalize(input = {}) {
  const raw = String(input.url || input.conversationUrl || input.chatgptUrl || '').trim();
  const id = cleanId(input.conversationId) || idFromUrl(raw);
  if (!raw && !id) return null;
  const url = raw ? strip(raw) : `https://chatgpt.com/c/${encodeURIComponent(id)}`;
  return { conversationId: id, url, provider: 'chatgpt' };
}
function idFromUrl(value = '') {
  const text = String(value || '');
  const custom = text.match(/^https:\/\/chatgpt\.com\/g\/[^/]+\/c\/([^/?#]+)/i);
  if (custom) return decodeURIComponent(custom[1]);
  const normal = text.match(/^https:\/\/(chatgpt\.com|chat\.openai\.com)\/c\/([^/?#]+)/i);
  return normal ? decodeURIComponent(normal[2]) : '';
}
function strip(raw = '') {
  try { const url = new URL(raw); url.search = ''; url.hash = ''; return url.toString().replace(/\/$/, ''); }
  catch { return raw; }
}
function cleanId(value = '') { return String(value || '').trim(); }
module.exports = { normalize, idFromUrl, strip, cleanId };
