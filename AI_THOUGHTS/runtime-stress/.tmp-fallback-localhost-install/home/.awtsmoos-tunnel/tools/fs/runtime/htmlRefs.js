// B"H
/**
 * @file htmlRefs.js
 * @description
 * Chapter 4: The Awtsmoos read every tag like a constellation. Some stars were
 * scripts, some were styles, some were doors, and each revealed a reachable file.
 */

function htmlTags(text = "") {
  const tags = [];
  for (const match of String(text).matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    tags.push({ name: match[1].toLowerCase(), raw: match[2] || "" });
  }
  return tags;
}

function attrsOf(raw = "") {
  const attrs = {};
  const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of String(raw).matchAll(re)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function refsFromHtml(text = "") {
  const refs = [];
  for (const tag of htmlTags(text)) {
    const attrs = attrsOf(tag.raw);
    if (tag.name === "link" && attrs.href) refs.push(attrs.href);
    if ((tag.name === "a" || tag.name === "form") && /\.html?($|[?#])/i.test(attrs.href || attrs.action || "")) refs.push(attrs.href || attrs.action);
    for (const attr of ["src", "data", "poster"]) if (attrs[attr]) refs.push(attrs[attr]);
  }
  return refs;
}

module.exports = { attrsOf, htmlTags, refsFromHtml };
