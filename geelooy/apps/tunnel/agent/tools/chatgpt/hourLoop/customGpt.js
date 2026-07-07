// B"H

/** B"H — Chapter 1961: A custom GPT path opens a sibling doorway. */
function parse(url = '') {
  const text = String(url || '');
  const match = text.match(/^https:\/\/chatgpt\.com\/g\/([^/]+)(?:\/c\/([^/?#]+))?/i);
  if (!match) return { custom: false, gptId: '', conversationId: idFromNormal(text), sourceUrl: text };
  return { custom: true, gptId: decodeURIComponent(match[1]), conversationId: match[2] ? decodeURIComponent(match[2]) : '', sourceUrl: text };
}
function newChatUrl(input = {}) {
  const info = input.custom !== undefined ? input : parse(input.url || input.sourceUrl || '');
  return info.custom && info.gptId ? `https://chatgpt.com/g/${encodeURIComponent(info.gptId)}` : 'https://chatgpt.com/';
}
function conversationUrl(input = {}) {
  if (input.url) return input.url;
  if (input.custom && input.gptId && input.conversationId) return `https://chatgpt.com/g/${encodeURIComponent(input.gptId)}/c/${encodeURIComponent(input.conversationId)}`;
  return input.conversationId ? `https://chatgpt.com/c/${encodeURIComponent(input.conversationId)}` : newChatUrl(input);
}
function idFromNormal(url = '') { const m = String(url).match(/\/c\/([^/?#]+)/); return m ? decodeURIComponent(m[1]) : ''; }
module.exports = { parse, newChatUrl, conversationUrl, idFromNormal };
