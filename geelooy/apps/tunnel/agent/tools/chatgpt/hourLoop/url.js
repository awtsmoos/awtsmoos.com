// B"H

/**
 * B"H
 * Chapter 1941: A pasted URL becomes a clean thread of mission breath.
 */
function normalize(input = {}) {
  const raw = String(input.url || input.conversationUrl || input.chatgptUrl || '').trim();
  const id = cleanId(input.conversationId) || idFromUrl(raw);
  if (!raw && !id) return null;
  const url = id ? `https://chatgpt.com/c/${encodeURIComponent(id)}` : strip(raw);
  return { conversationId: id || idFromUrl(url), url, provider: 'chatgpt' };
}

function idFromUrl(value = '') {
  const match = String(value).match(/^https:\/\/(chatgpt\.com|chat\.openai\.com)\/c\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[2]) : '';
}

function strip(raw = '') {
  try {
    const url = new URL(raw);
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return raw;
  }
}

function cleanId(value = '') {
  return String(value || '').trim();
}

module.exports = { normalize, idFromUrl, strip, cleanId };
