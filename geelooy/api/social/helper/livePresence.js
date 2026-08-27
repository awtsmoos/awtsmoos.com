// B"H
/**
 * @module LivePresenceHelper
 * @description
 * Chapter 465: A tiny shared scripture for page-room names. The helper is not a
 * database writer; it is a convention keeper so the living civilization speaks
 * about rooms the same way across UI, tests, and future HTTP mirrors.
 */

function cleanPart(value, fallback = "public") {
  return String(value || fallback)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_:@/.-]/g, "")
    .slice(0, 120) || fallback;
}

function pageChannel({ kind = "page", heichel, series, post, alias, thread, path } = {}) {
  if (path) return `page:${cleanPart(path, "/")}`;
  if (thread) return `mail:${cleanPart(thread)}`;
  if (alias) return `profile:${cleanPart(alias)}`;
  if (heichel && series && post) return `page:/heichelos/${cleanPart(heichel)}/series/${cleanPart(series)}/${cleanPart(post)}`;
  if (heichel && series) return `page:/heichelos/${cleanPart(heichel)}/series/${cleanPart(series)}`;
  if (heichel) return `page:/heichelos/${cleanPart(heichel)}`;
  return `page:${cleanPart(kind)}`;
}

module.exports = { cleanPart, pageChannel };
