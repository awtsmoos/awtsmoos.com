//B"H
import { escapeHtml } from "../escapeHtml.js";
import { highlightedCode } from "../event-ui/codeHighlight.js";
import { inlineMarkdown } from "./inline.js";

/**
 * Chapter 50: The Fence Stood While The River Was Still Falling.
 *
 * Markdown must not depend on the stream being finished. A half-born code
 * fence, an indented fence, or a finished `txt` fence all become stable code
 * vessels. Normalization never mutates text inside fences, because the Awtsmoos
 * gives code its own sanctuary where even punctuation keeps its exact mission.
 *
 * @param {string} text Raw markdown text.
 * @returns {string} Safe rendered HTML.
 */
export function renderBlocks(text = "") {
  const source = normalizeMarkdownSource(text);
  if (!source.trim()) return "";
  const lines = source.split("\n");
  const state = makeState();
  for (const line of lines) consumeLine(state, line);
  finishDocument(state);
  return state.html.join("\n");
}

/**
 * Repairs only outside fenced code.
 *
 * @param {string} text Raw markdown.
 * @returns {string} Normalized markdown.
 */
export function normalizeMarkdownSource(text = "") {
  const raw = String(text || "").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  let inFence = false;
  return lines.map(line => {
    if (isFenceLine(line)) {
      inFence = !inFence;
      return line;
    }
    return inFence ? line : normalizeOutsideFence(line);
  }).join("\n").replace(/\n{4,}/g, "\n\n\n");
}

function makeState() {
  return { html: [], paragraph: [], list: null, quote: [], code: null };
}

function consumeLine(state, line) {
  const fence = parseFence(line);
  if (fence) return consumeFence(state, fence);
  if (state.code) return state.code.lines.push(line);
  if (!line.trim()) return flushFlow(state);
  const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
  if (heading) return pushHeading(state, heading);
  if (/^\s{0,3}(?:---+|___+|\*\*\*+)\s*$/.test(line)) return pushHr(state);
  const quote = line.match(/^\s{0,3}>\s?(.*)$/);
  if (quote) return pushQuote(state, quote[1]);
  const unordered = line.match(/^\s{0,3}[-*+]\s+(.+)$/);
  const ordered = line.match(/^\s{0,3}\d+[.)]\s+(.+)$/);
  if (unordered || ordered) return pushListItem(state, unordered ? "ul" : "ol", (unordered || ordered)[1]);
  state.paragraph.push(line);
}

function consumeFence(state, fence) {
  if (state.code) {
    state.html.push(renderCodeFence(state.code.language, state.code.lines.join("\n")));
    state.code = null;
    return;
  }
  flushFlow(state);
  state.code = { language: fence.language || "text", lines: [] };
}

function finishDocument(state) {
  if (state.code) state.html.push(renderCodeFence(state.code.language, state.code.lines.join("\n")));
  state.code = null;
  flushFlow(state);
}

function pushHeading(state, heading) {
  flushFlow(state);
  const level = heading[1].length;
  state.html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
}

function pushHr(state) {
  flushFlow(state);
  state.html.push("<hr>");
}

function pushQuote(state, text) {
  flushParagraph(state);
  flushList(state);
  state.quote.push(text);
}

function pushListItem(state, type, text) {
  flushParagraph(state);
  flushQuote(state);
  if (!state.list || state.list.type !== type) flushList(state);
  if (!state.list) state.list = { type, items: [] };
  state.list.items.push(text);
}

function flushFlow(state) {
  flushParagraph(state);
  flushList(state);
  flushQuote(state);
}

function flushParagraph(state) {
  if (!state.paragraph.length) return;
  state.html.push(`<p>${state.paragraph.map(inlineMarkdown).join("<br>")}</p>`);
  state.paragraph = [];
}

function flushList(state) {
  if (!state.list) return;
  state.html.push(`<${state.list.type}>${state.list.items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</${state.list.type}>`);
  state.list = null;
}

function flushQuote(state) {
  if (!state.quote.length) return;
  state.html.push(`<blockquote>${state.quote.map(inlineMarkdown).join("<br>")}</blockquote>`);
  state.quote = [];
}

function parseFence(line = "") {
  const match = line.match(/^\s{0,3}(```+|~~~+)\s*([^`]*)\s*$/);
  return match ? { marker: match[1], language: String(match[2] || "").trim() } : null;
}

function isFenceLine(line = "") {
  return Boolean(parseFence(line));
}

function normalizeOutsideFence(line = "") {
  return line
    .replace(/([^\s])(```|~~~)/g, "$1\n$2")
    .replace(/([^\n\s#])\s*(#{1,6}\s+)/g, "$1\n$2");
}

function renderCodeFence(language, code) {
  const lang = escapeHtml(String(language || "text").trim() || "text");
  const highlighted = highlightedCode(code, lang);
  const encoded = encodeURIComponent(code);
  return `<div class="md-code-block" data-language="${lang}"><div class="md-code-toolbar"><span class="md-code-language">${lang}</span><button class="md-code-copy" type="button" onclick="navigator.clipboard?.writeText(decodeURIComponent('${encoded}'))">Copy</button></div><pre class="md-code"><code class="language-${lang}" data-language="${lang}">${highlighted}</code></pre></div>`;
}
