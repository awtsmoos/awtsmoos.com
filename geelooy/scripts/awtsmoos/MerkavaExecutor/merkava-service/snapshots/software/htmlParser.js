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

/** Parse attribute string into {name: value}. */
function parseAttributes(attrText) {
  const attrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(attrText || "")) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : "";
    // First-wins semantics for duplicate attributes.
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
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
    const tagInner = clean.slice(lt + 1, gt).trim();
    pos = gt + 1;

    if (!tagInner) continue;
    // Closing tag.
    if (tagInner[0] === "/") {
      const name = tagInner.slice(1).split(/\s/)[0].toLowerCase();
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
    if (tagInner[0] === "?" || tagInner[0] === "!") continue;

    const selfClosing = tagInner.endsWith("/");
    const inner = selfClosing ? tagInner.slice(0, -1).trim() : tagInner;
    const spaceIdx = inner.search(/\s/);
    const name = (spaceIdx < 0 ? inner : inner.slice(0, spaceIdx)).toLowerCase();
    const attrText = spaceIdx < 0 ? "" : inner.slice(spaceIdx + 1);
    if (!/^[a-zA-Z][\w-]*$/.test(name)) continue;

    // Skip head content except we still need to walk past it.
    // <style> and <script> are raw-text: consume until close tag.
    // B"H 2026-10-09 (css-worker-2): <textarea> is raw-text for its CONTENT
    // but the element itself must survive (it renders as a control). Keep the
    // element and stash the raw text as its child instead of dropping it.
    if (name === "textarea") {
      const el = makeElement(name, parseAttributes(attrText));
      stack[stack.length - 1].children.push(el);
      const closeRe = new RegExp(`</${name}\\s*>`, "i");
      const rest = clean.slice(pos);
      const cm = closeRe.exec(rest);
      let raw = "";
      if (cm) { raw = rest.slice(0, cm.index); pos += cm.index + cm[0].length; }
      else { raw = rest; pos = len; }
      if (raw) el.children.push(makeText(decodeEntities(raw)));
      continue;
    }
    if (RAW_TEXT_ELEMENTS.has(name)) {
      const closeRe = new RegExp(`</${name}\\s*>`, "i");
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
        let depth = 1;
        while (pos < len && depth > 0) {
          const nlt = clean.indexOf("<", pos);
          if (nlt < 0) { pos = len; break; }
          const ngt = clean.indexOf(">", nlt + 1);
          if (ngt < 0) { pos = len; break; }
          const nInner = clean.slice(nlt + 1, ngt).trim().toLowerCase();
          pos = ngt + 1;
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
