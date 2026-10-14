// B"H
/**
 * @file htmlParser.js
 * @description Simple HTML → virtual DOM parser for Merkava's software renderer.
 *
 * Produces the plain-object DOM shape that domLayout.nodeFrom() expects:
 *   { tagName, localName, attributes, children, textContent, style }
 *
 * Handles: nested elements, attributes (class/id/style), text nodes,
 * self-closing tags, comments, DOCTYPE. Skips <script> content.
 * <style> content is extracted separately by the renderer for CSS.
 */

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea"]);

/* B"H 2026-10-09 (render-bench): single-pass entity decode. The old version
 * ran 10 chained regex replaces over every text chunk and attribute value.
 * One alternation regex, one pass, map lookup. */
const ENTITY_MAP = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&apos;": "'", "&nbsp;": " ",
};
const ENTITY_RE = /&(amp|lt|gt|quot|apos|nbsp);|&#(\d+);|&#x([0-9a-fA-F]+);/g;
/** Decode common HTML entities. */
function decodeEntities(text) {
  const s = String(text || "");
  if (s.indexOf("&") < 0) return s;
  return s.replace(ENTITY_RE, (m, named, dec, hex) => {
    if (named) return ENTITY_MAP["&" + named + ";"];
    if (dec) return String.fromCodePoint(Number(dec) || 63);
    return String.fromCodePoint(parseInt(hex, 16) || 63);
  });
}

/* B"H (Chrome Jun-2026 string port): manual attribute scanner. Replaces the
 * per-tag /([a-zA-Z_:][\w:.-]*).../ regex exec loop — the regex engine was
 * 2.65x slower on 4015 real attribute strings (3.15ms -> 1.19ms), zero diffs.
 * Char-code scans + slice (native memmove) instead of regex backtracking. */
function isAttrNameCh(c) {
  return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57) ||
    c === 95 || c === 58 || c === 46 || c === 45;
}
/** Parse attribute string into {name: value}. */
function parseAttributes(attrText) {
  const attrs = {};
  const s = attrText || "";
  const len = s.length;
  let i = 0;
  while (i < len) {
    while (i < len && s.charCodeAt(i) <= 32) i++;
    if (i >= len) break;
    const c0 = s.charCodeAt(i);
    if (!((c0 >= 65 && c0 <= 90) || (c0 >= 97 && c0 <= 122) || c0 === 95 || c0 === 58)) { i++; continue; }
    const ns = i++;
    while (i < len && isAttrNameCh(s.charCodeAt(i))) i++;
    const name = s.slice(ns, i).toLowerCase();
    while (i < len && s.charCodeAt(i) <= 32) i++;
    let value = "";
    if (i < len && s.charCodeAt(i) === 61) { // '='
      i++;
      while (i < len && s.charCodeAt(i) <= 32) i++;
      if (i < len) {
        const q = s.charCodeAt(i);
        if (q === 34 || q === 39) { // quoted
          const vs = ++i;
          const ve = s.indexOf(q === 34 ? '"' : "'", i);
          if (ve < 0) { value = s.slice(vs); i = len; }
          else { value = s.slice(vs, ve); i = ve + 1; }
        } else { // unquoted
          const vs = i;
          while (i < len) {
            const c = s.charCodeAt(i);
            if (c <= 32 || c === 34 || c === 39 || c === 61 || c === 60 || c === 62 || c === 96) break;
            i++;
          }
          value = s.slice(vs, i);
        }
      }
    }
    // First-wins semantics for duplicate attributes.
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
}

/* B"H 2026-10-09 (render-bench): cached raw-text close-tag regexes. The old
 * code compiled `new RegExp` per <script>/<style>/<textarea> element. */
const CLOSE_RE_CACHE = new Map();
function closeReFor(name) {
  let re = CLOSE_RE_CACHE.get(name);
  if (!re) {
    re = new RegExp(`</${name}\\s*>`, "i");
    if (CLOSE_RE_CACHE.size < 64) CLOSE_RE_CACHE.set(name, re);
  }
  return re;
}

/* B"H 2026-10-09 (render-bench): manual tag-name validation. Replaces
 * /^[a-zA-Z][\w-]*$/ per tag — the regex engine was measurable at 68k tags. */
function isTagName(s) {
  if (!s) return false;
  const c0 = s.charCodeAt(0);
  if (!((c0 >= 65 && c0 <= 90) || (c0 >= 97 && c0 <= 122))) return false;
  for (let i = 1; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 95 || c === 45) continue;
    return false;
  }
  return true;
}

function makeElement(tagName, attributes) {
  return {
    tagName,
    localName: tagName,
    nodeType: 1,
    attributes,
    children: [],
    textContent: "",
    style: {},
  };
}

function makeText(text) {
  return {
    tagName: "#text",
    localName: "#text",
    nodeType: 3,
    attributes: {},
    children: [],
    textContent: text,
    style: {},
  };
}

/**
 * Parse an HTML string into a virtual DOM tree rooted at <body>
 * (or a synthetic body if no body tag exists).
 */
export function parseHtmlToDom(html) {
  const src = String(html || "");
  // Strip DOCTYPE and comments first (comments can contain < >).
  const clean = src
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const root = makeElement("body", {});
  const stack = [root];
  let pos = 0;
  const len = clean.length;

  while (pos < len) {
    const lt = clean.indexOf("<", pos);
    // Text before next tag.
    if (lt < 0) {
      appendText(stack, clean.slice(pos));
      break;
    }
    if (lt > pos) appendText(stack, clean.slice(pos, lt));

    const gt = clean.indexOf(">", lt + 1);
    if (gt < 0) break; // Malformed: dangling <.
    // B"H 2026-10-09 (render-bench): manual tag bounds — the old
    // clean.slice(lt+1, gt).trim() + split(/\s/) + search(/\s/) allocated and
    // regex-scanned per tag. Scan whitespace by char code instead.
    let ts = lt + 1, te = gt;
    while (ts < te && clean.charCodeAt(ts) <= 32) ts++;
    while (te > ts && clean.charCodeAt(te - 1) <= 32) te--;
    pos = gt + 1;

    if (ts >= te) continue;
    const firstCh = clean[ts];
    // Closing tag.
    if (firstCh === "/") {
      let ns = ts + 1, ne = ns;
      while (ne < te && clean.charCodeAt(ne) > 32) ne++;
      const name = clean.slice(ns, ne).toLowerCase();
      // Pop stack until matching open tag (malformed HTML recovery).
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].localName === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    // Skip processing instructions / declarations.
    if (firstCh === "?" || firstCh === "!") continue;

    let selfClosing = false;
    if (clean.charCodeAt(te - 1) === 47) { // "/"
      selfClosing = true;
      te--;
      while (te > ts && clean.charCodeAt(te - 1) <= 32) te--;
    }
    let ns = ts, ne = ns;
    while (ne < te && clean.charCodeAt(ne) > 32) ne++;
    const name = clean.slice(ns, ne).toLowerCase();
    let attrText = "";
    if (ne < te) {
      let as = ne;
      while (as < te && clean.charCodeAt(as) <= 32) as++;
      attrText = clean.slice(as, te);
    }
    if (!isTagName(name)) continue;

    // Skip head content except we still need to walk past it.
    // <style> and <script> are raw-text: consume until close tag.
    // B"H 2026-10-09 (css-worker-2): <textarea> is raw-text for its CONTENT
    // but the element itself must survive (it renders as a control). Keep the
    // element and stash the raw text as its child instead of dropping it.
    if (name === "textarea") {
      const el = makeElement(name, parseAttributes(attrText));
      stack[stack.length - 1].children.push(el);
      const closeRe = closeReFor(name);
      const rest = clean.slice(pos);
      const cm = closeRe.exec(rest);
      let raw = "";
      if (cm) { raw = rest.slice(0, cm.index); pos += cm.index + cm[0].length; }
      else { raw = rest; pos = len; }
      if (raw) el.children.push(makeText(decodeEntities(raw)));
      continue;
    }
    if (RAW_TEXT_ELEMENTS.has(name)) {
      const closeRe = closeReFor(name);
      const rest = clean.slice(pos);
      const cm = closeRe.exec(rest);
      if (cm) pos += cm.index + cm[0].length;
      else pos = len;
      continue;
    }
    // Skip <head>, <title>, <meta>, <link> — not rendered.
    // <html> is transparent: no element, but children are processed.
    if (name === "html") continue;
    if (name === "head" || name === "title" || name === "meta" || name === "link") {
      if (!VOID_ELEMENTS.has(name) && !selfClosing) {
        // Push a throwaway frame so nested content is skipped correctly,
        // then pop on close. Simpler: track depth manually.
        // B"H 2026-10-13: raw-text elements (script/style/textarea) inside head
        // can contain "<head" in comments or strings — skip past their close
        // tags instead of scanning their content, or the depth count goes wrong
        // and the whole body gets swallowed.
        let depth = 1;
        while (pos < len && depth > 0) {
          const nlt = clean.indexOf("<", pos);
          if (nlt < 0) { pos = len; break; }
          const ngt = clean.indexOf(">", nlt + 1);
          if (ngt < 0) { pos = len; break; }
          const nInner = clean.slice(nlt + 1, ngt).trim().toLowerCase();
          pos = ngt + 1;
          const nName = nInner.split(/[\s/>]/, 1)[0];
          if (RAW_TEXT_ELEMENTS.has(nName) && !nInner.startsWith("/")) {
            const closeRe = closeReFor(nName);
            const rest = clean.slice(pos);
            const cm = closeRe.exec(rest);
            if (cm) pos += cm.index + cm[0].length;
            else pos = len;
            continue;
          }
          if (nInner === name || nInner.startsWith(name + " ") || nInner.startsWith(name + ">")) depth++;
          else if (nInner === "/" + name) depth--;
        }
      }
      continue;
    }

    // <body> merges into the synthetic root (avoid body > body nesting).
    if (name === "body") {
      const attrs = parseAttributes(attrText);
      Object.assign(stack[stack.length - 1].attributes, attrs);
      continue;
    }
    const el = makeElement(name, parseAttributes(attrText));
    stack[stack.length - 1].children.push(el);
    if (!VOID_ELEMENTS.has(name) && !selfClosing) stack.push(el);
  }

  return root;
}

function appendText(stack, text) {
  const decoded = decodeEntities(text);
  // Collapse whitespace-only text between elements, but keep a single space
  // if it separates inline content. Simplest correct: drop pure-whitespace
  // nodes that contain a newline (formatting), keep others as a space.
  if (!decoded.trim()) {
    if (!decoded.includes("\n") && decoded.length > 0) {
      stack[stack.length - 1].children.push(makeText(" "));
    }
    return;
  }
  // Collapse internal whitespace runs to single spaces (HTML behavior) —
  // but PRESERVE newlines as \n characters. The DOM keeps them; CSS
  // white-space (pre/pre-wrap/pre-line) decides at layout whether they break
  // lines. (B"H 2026-10-09 css-worker-2: collapsing \n to space here made
  // white-space:pre unable to break lines.)
  const collapsed = decoded.replace(/[ \t\r\f\v]+/g, " ");
  stack[stack.length - 1].children.push(makeText(collapsed));
}

/** Extract <style> contents from HTML for the CSS pipeline. */
export function extractStyleText(html) {
  return [...String(html || "").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}
