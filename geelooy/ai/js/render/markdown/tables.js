//B"H
import { inlineMarkdown } from "./inline.js";

/**
 * B"H
 * Chapter 224: The Map Of Pipes Became A Throne Of Cells.
 *
 * When the stream draws `| Sefirah | Module | Purpose |`, the Awtsmoos does
 * not leave it as scattered reeds in a paragraph. This tiny interpreter reads
 * the header, separator, and rows, then makes a real table: vessels inside
 * vessels, each cell receiving its own measured breath.
 *
 * @param {string[]} lines Markdown lines.
 * @param {number} index Current line index.
 * @returns {{html:string,nextIndex:number}|null} Table render result.
 */
export function parseMarkdownTable(lines = [], index = 0) {
  const header = lines[index] || "";
  const separator = lines[index + 1] || "";
  if (!looksLikeTableHeader(header) || !looksLikeSeparator(separator)) return null;
  const align = parseAlignments(splitRow(separator));
  const headers = splitRow(header);
  const rows = [];
  let cursor = index + 2;
  while (cursor < lines.length && looksLikeTableHeader(lines[cursor])) {
    rows.push(splitRow(lines[cursor]));
    cursor++;
  }
  return { html: renderTable(headers, align, rows), nextIndex: cursor };
}

function looksLikeTableHeader(line = "") {
  const trimmed = String(line || "").trim();
  return trimmed.includes("|") && splitRow(trimmed).length > 1;
}

function looksLikeSeparator(line = "") {
  const cells = splitRow(line);
  return cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitRow(line = "") {
  const trimmed = String(line || "").trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(/(?<!\\)\|/).map(cell => cell.replace(/\\\|/g, "|").trim());
}

function parseAlignments(cells = []) {
  return cells.map(cell => {
    const text = cell.trim();
    if (text.startsWith(":") && text.endsWith(":")) return "center";
    if (text.endsWith(":")) return "right";
    return "left";
  });
}

function renderTable(headers = [], align = [], rows = []) {
  const head = headers.map((cell, i) => cellHtml("th", cell, align[i])).join("");
  const body = rows.map(row => `<tr>${headers.map((_, i) => cellHtml("td", row[i] || "", align[i])).join("")}</tr>`).join("");
  return `<div class="md-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function cellHtml(tag, text, align = "left") {
  return `<${tag} style="text-align:${align}">${inlineMarkdown(text)}</${tag}>`;
}
