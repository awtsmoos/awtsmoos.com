//B"H
import { escapeHtml } from "../escapeHtml.js";
import { inlineMarkdown } from "./inline.js";

/**
 * B"H — Small but resilient markdown renderer for streamed text.
 * It repairs common stream boundary joins like `word## Heading` before block
 * parsing, while preserving real paragraphs, Hebrew, code fences, lists, and
 * protocol chips.
 */
export function renderBlocks(text = "") {
  const source = normalizeMarkdownSource(text);
  if (!source.trim()) return "";
  const lines = source.split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let code = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    html.push(`<${list.type}>${list.items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote>${quote.map(inlineMarkdown).join("<br>")}</blockquote>`);
    quote = [];
  };
  const flushFlow = () => { flushParagraph(); flushList(); flushQuote(); };

  for (const line of lines) {
    const fence = line.match(/^```\s*([^`]*)\s*$/);
    if (fence) {
      if (code) {
        html.push(renderCodeFence(code.language, code.lines.join("\n")));
        code = null;
      } else {
        flushFlow();
        code = { language: fence[1] || "", lines: [] };
      }
      continue;
    }
    if (code) { code.lines.push(line); continue; }
    if (!line.trim()) { flushFlow(); continue; }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushFlow();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const hr = line.match(/^\s*(?:---+|___+|\*\*\*+)\s*$/);
    if (hr) { flushFlow(); html.push("<hr>"); continue; }
    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushParagraph(); flushList(); quote.push(quoteLine[1]); continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph(); flushQuote();
      const type = unordered ? "ul" : "ol";
      if (!list || list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push((unordered || ordered)[1]);
      continue;
    }
    paragraph.push(line);
  }
  if (code) html.push(renderCodeFence(code.language, code.lines.join("\n")));
  flushFlow();
  return html.join("\n");
}

export function normalizeMarkdownSource(text = "") {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])(```)/g, "$1\n$2")
    .replace(/(```[^\n]*)([^\n])/g, "$1\n$2")
    .replace(/([^\n\s#])\s*(#{1,6}\s+)/g, "$1\n\n$2")
    .replace(/([^\n])\s*(---{2,}|___{2,}|\*\*\*+)\s*\n/g, "$1\n\n$2\n")
    .replace(/\n{3,}/g, "\n\n");
}

function renderCodeFence(language, code) {
  const lang = escapeHtml(String(language || "").trim());
  return `<pre class="md-code"><code${lang ? ` data-language="${lang}"` : ""}>${escapeHtml(code)}</code></pre>`;
}
