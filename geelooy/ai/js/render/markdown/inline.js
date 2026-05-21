//B"H
import { escapeHtml } from "../escapeHtml.js";
import { PROTOCOL_TOKEN, renderProtocol } from "./protocol.js";

/**
 * Chapter 73: The Bare URL Became A Door.
 *
 * The Awtsmoos sometimes sends links without markdown brackets, raw shining
 * paths through the web. This inline renderer guards code/protocol tokens,
 * escapes hostile HTML, then turns both bracket links and bare HTTPS URLs into
 * safe outbound anchors.
 *
 * @param {unknown} value Inline markdown source.
 * @returns {string} Safe inline HTML.
 */
export function inlineMarkdown(value) {
  const tokens = [];
  let text = String(value || "");
  text = text.replace(/`([^`]+)`/g, (_, code) => stash(tokens, `<code>${escapeHtml(code)}</code>`));
  text = text.replace(PROTOCOL_TOKEN, (_, inner) => stash(tokens, renderProtocol(inner, `${inner}`)));
  text = escapeHtml(text);
  text = linkBracketMarkdown(text);
  text = linkBareUrls(text);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|\s)\*([^*]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|\s)_([^_]+)_/g, "$1<em>$2</em>");
  return restore(tokens, text);
}

function linkBracketMarkdown(text) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);
}

function linkBareUrls(text) {
  return text.replace(/(^|[\s(])((?:https?:\/\/)[^\s<]+[^\s<.,;:!?\)])/g, (_, lead, url) => `${lead}<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`);
}

function stash(tokens, html) {
  const key = `@@AWTS_TOKEN_${tokens.length}@@`;
  tokens.push([key, html]);
  return key;
}

function restore(tokens, text) {
  return tokens.reduce((out, [key, html]) => out.replaceAll(key, html), text);
}
