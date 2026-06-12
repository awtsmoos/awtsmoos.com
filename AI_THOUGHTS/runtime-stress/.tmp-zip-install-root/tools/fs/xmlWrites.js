// B"H
const HEBREW_START = '₪₪₪_בס"ד_תחילת_הקוד_₪₪₪';
const HEBREW_END = '₪₪₪_בס"ד_סוף_הקוד_₪₪₪';
const PLACEHOLDER_STARTS = ["{{AWTSMOOS_CDATA_START}}", "[[AWTSMOOS_CDATA_START]]", "__AWTSMOOS_CDATA_START__", HEBREW_START];
const PLACEHOLDER_ENDS = ["{{AWTSMOOS_CDATA_END}}", "[[AWTSMOOS_CDATA_END]]", "__AWTSMOOS_CDATA_END__", HEBREW_END];

/**
 * B"H
 * Chapter 391: XML learned mercy for the AI scribe.
 * The agent may send raw XML writes without hand-crafting CDATA. It may wrap
 * content in Hebrew vibe markers, AWTSMOOS_CDATA placeholders, real CDATA, or
 * plain escaped XML text. The parser turns all into full-file write specs.
 */
function looksXml(value) {
  const text = String(value || "").trim();
  return /<(awtsmoosWrites|writes|files|change|fileWrite|writeFile|file)\b/i.test(text);
}

function normalizeXmlPayload(payload = {}) {
  return firstText(payload, ["xml", "xmlInput", "writesXml", "filesXml", "content", "text", "body"]);
}

function firstText(payload, names) {
  for (const name of names) if (typeof payload[name] === "string" && looksXml(payload[name])) return payload[name];
  return "";
}

function transfigurePlaceholders(raw) {
  let text = String(raw || "");
  for (const marker of PLACEHOLDER_STARTS) text = text.split(marker).join("<![CDATA[");
  for (const marker of PLACEHOLDER_ENDS) text = text.split(marker).join("]]>");
  return text;
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function attrs(tagText) {
  const out = {};
  for (const match of String(tagText || "").matchAll(/([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(["'])([\s\S]*?)\2/g)) out[match[1]] = decodeEntities(match[3]);
  return out;
}

function tagValue(block, tag) {
  const rx = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = rx.exec(block);
  return match ? unwrapContent(match[1]) : "";
}

function unwrapContent(value) {
  const text = String(value || "");
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(text);
  return cdata ? cdata[1] : decodeEntities(text);
}

function filePathFrom(openTag, inner) {
  const a = attrs(openTag);
  return a.path || a.p || a.file || tagValue(inner, "path") || tagValue(inner, "file") || "";
}

function contentFrom(inner) {
  return tagValue(inner, "content") || tagValue(inner, "text") || tagValue(inner, "body") || "";
}

function parseNodeWrites(xml) {
  const out = [];
  const normalized = transfigurePlaceholders(xml);
  const rx = /<(change|fileWrite|writeFile|file)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of normalized.matchAll(rx)) {
    const openTag = match[2] || "";
    const inner = match[3] || "";
    const p = filePathFrom(openTag, inner).trim();
    const op = (attrs(openTag).operation || tagValue(inner, "operation") || "write").trim().toLowerCase();
    if (!p || op === "delete") continue;
    out.push({ path: p, content: contentFrom(inner) });
  }
  return out;
}

function parseSelfClosingWrites(xml) {
  const out = [];
  const normalized = transfigurePlaceholders(xml);
  const rx = /<(fileWrite|writeFile|file)\b([^>]*?)\/>/gi;
  for (const match of normalized.matchAll(rx)) {
    const a = attrs(match[2] || "");
    const p = String(a.path || a.p || a.file || "").trim();
    if (p) out.push({ path: p, content: String(a.content || a.text || "") });
  }
  return out;
}

function parseXmlWritesFromText(xml) {
  const text = transfigurePlaceholders(xml);
  return [...parseNodeWrites(text), ...parseSelfClosingWrites(text)].filter(x => x.path);
}

function parseXmlWrites(payload = {}) {
  const xml = normalizeXmlPayload(payload);
  return xml ? parseXmlWritesFromText(xml) : [];
}

module.exports = { HEBREW_START, HEBREW_END, parseXmlWrites, parseXmlWritesFromText, transfigurePlaceholders, looksXml };
