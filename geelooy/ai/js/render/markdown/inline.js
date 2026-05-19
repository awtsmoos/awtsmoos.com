//B"H
import { escapeHtml } from "../escapeHtml.js";
import { PROTOCOL_TOKEN, renderProtocol } from "./protocol.js";

export function inlineMarkdown(value) {
  const tokens = [];
  let text = String(value || "");
  text = text.replace(/`([^`]+)`/g, (_, code) => stash(tokens, `<code>${escapeHtml(code)}</code>`));
  text = text.replace(PROTOCOL_TOKEN, (_, inner) => stash(tokens, renderProtocol(inner, `${inner}`)));
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|\s)\*([^*]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|\s)_([^_]+)_/g, "$1<em>$2</em>");
  return restore(tokens, text);
}

function stash(tokens, html) {
  const key = `@@AWTS_TOKEN_${tokens.length}@@`;
  tokens.push([key, html]);
  return key;
}

function restore(tokens, text) {
  return tokens.reduce((out, [key, html]) => out.replaceAll(key, html), text);
}
