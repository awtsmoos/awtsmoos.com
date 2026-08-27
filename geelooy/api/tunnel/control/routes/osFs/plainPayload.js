// B"H
/**
 * Hosted Virtual OS payload normalization.
 * Chapter 482: The hosted scribe learned the same tongues as the native one:
 * JSON carriers, object maps, alias keys, arrays, and XML placeholder vessels.
 */
const CARRIERS = ["writes", "files", "fileWrites", "changes", "content", "body", "params", "payload", "writesJson", "filesJson", "json", "input"];
const PATH_KEYS = ["path", "p", "file", "filePath", "filename", "name", "target", "dest"];
const CONTENT_KEYS = ["content", "text", "body", "value", "data", "source", "contents"];

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return value;
  try { return JSON.parse(text); } catch { return value; }
}

function parsePlainList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return Object.keys(parsed);
  if (typeof value !== "string") return [];
  return value.trim().split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
}

function parsePlainWrites(payload = {}) {
  if (Array.isArray(payload)) return payload.map(normalizeWrite).filter(Boolean);
  const xml = parseXmlWrites(payload);
  if (xml.length) return xml;
  const fused = fusePayload(payload);
  return directWrites(fused).map(normalizeWrite).filter(Boolean);
}

function describePlainWrites(payload = {}) {
  return { carrierKeys: Array.isArray(payload) ? ["<array>"] : CARRIERS.filter(k => payload[k] !== undefined), writeCount: parsePlainWrites(payload).length };
}

function fusePayload(payload = {}) {
  const out = { ...payload };
  for (const key of CARRIERS) absorb(out, payload[key]);
  return out;
}

function absorb(out, value) {
  const parsed = parseMaybeJson(value);
  if (!parsed || parsed === value) return;
  if (Array.isArray(parsed)) {
    if (!Array.isArray(out.writes)) out.writes = parsed;
    return;
  }
  if (typeof parsed === "object") for (const [k, v] of Object.entries(parsed)) out[k] = parseMaybeJson(v);
}

function directWrites(fused) {
  const raw = parseMaybeJson(fused.writes ?? fused.files ?? fused.fileWrites ?? fused.changes);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return Object.entries(raw).map(([path, value]) => objectWrite(path, value));
  if (first(fused, PATH_KEYS)) return [fused];
  return [];
}

function objectWrite(path, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return { path, ...value };
  return { path, content: value };
}

function normalizeWrite(entry) {
  if (!entry || typeof entry !== "object") return null;
  const path = first(entry, PATH_KEYS);
  if (!path) return null;
  const content = first(entry, CONTENT_KEYS);
  return { ...entry, path: String(path), content: String(content ?? "") };
}

function parseXmlWrites(payload = {}) {
  const xml = String(payload.xml || payload.body || payload.content || payload.text || "").trim();
  if (!xml || !/<file\b/i.test(xml)) return [];
  const out = [];
  const rx = /<file\b([^>]*)>([\s\S]*?)<\/file>/gi;
  let m;
  while ((m = rx.exec(xml))) {
    const attrs = attrsOf(m[1]);
    const path = attrs.path || attrs.p || attrs.file || attrs.name;
    const body = innerTag(m[2], "content") ?? innerTag(m[2], "text") ?? m[2];
    if (path) out.push({ path, content: decodeXmlPayload(body) });
  }
  return out;
}

function attrsOf(text) {
  const attrs = {};
  String(text || "").replace(/([\w:-]+)=["']([^"']*)["']/g, (_, k, v) => { attrs[k] = entity(v); return ""; });
  return attrs;
}
function innerTag(text, tag) {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(text);
  return m ? m[1] : null;
}
function decodeXmlPayload(text) {
  return entity(String(text || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/\{\{AWTSMOOS_CDATA_START\}\}|\[\[AWTSMOOS_CDATA_START\]\]/g, "").replace(/\{\{AWTSMOOS_CDATA_END\}\}|\[\[AWTSMOOS_CDATA_END\]\]/g, ""));
}
function entity(text) { return String(text || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function first(object, keys) { for (const key of keys) if (object[key] !== undefined && object[key] !== null) return object[key]; return ""; }

module.exports = { parsePlainList, parsePlainWrites, describePlainWrites, parseMaybeJson };
