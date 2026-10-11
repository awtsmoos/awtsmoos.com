// B"H
/**
 * @file listMarkers.js
 * @description List markers + CSS counters for Merkava's software renderer.
 *
 * The executor-owned CssPseudoElements standard (merkava-browser) already
 * knows how to resolve `content` (strings, attr(), counter()) and match
 * ::marker/::before/::after rules — but the snapshot renderer never wired it
 * into layout. This module is the additive wiring:
 *
 *  - applyDocumentCounters(root): pre-order walk applying counter-reset /
 *    counter-increment in document order (must run BEFORE ::before content
 *    is resolved, so generated "Section N." prefixes see incremented values).
 *  - markerForLi(li, rules): synthesizes the default ::marker for an <li>
 *    from list-style-type (disc/circle/square/decimal/roman/alpha…),
 *    list-style-position, and the ol start/reversed attributes. An explicit
 *    author `::marker { content: … }` box (materialized by domLayout's
 *    pseudo-element pass) takes precedence — this only fills the default.
 *  - ::marker color comes from cascading author ::marker rules over the li.
 *  - list-style-image: url(…) cannot fetch images in a static snapshot, so
 *    it is replaced with a styled marker (◆) instead of dropping the bullet.
 */
import pseudoPkg from "../../../merkava-browser/standards/css/CssPseudoElements.js";

const { applyCounters, matchPseudoRules, resolveContent } = pseudoPkg;
export { applyCounters };

/** Pre-order walk applying CSS counters in document order. Idempotent per document. */
export function applyDocumentCounters(root) {
  const doc = root && root.ownerDocument;
  if (!doc) return;
  if (doc.__merkavaCountersApplied) return;
  doc.__merkavaCounters = {};
  doc.__merkavaCountersApplied = true;
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    if (n.nodeType === 1 && n.computedStyle) applyCounters(n, n.computedStyle);
    const kids = n.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}

/** Resolve ::before/::after generated text via the standards' content model. */
export function generatedTextFor(node, pseudo, rules) {
  let matched = null;
  try {
    matched = matchPseudoRules(node, pseudo, rules);
  } catch {
    return null;
  }
  if (!matched || !matched.length) return null;
  const style = cascadePseudoDecls(matched, (node && node.computedStyle) || {});
  let text = null;
  try {
    text = resolveContent(style.content, node);
  } catch {
    return null;
  }
  if (text == null || text === "") return null;
  return { text, style };
}

/**
 * Cascade already-matched pseudo-element rules by (important, specificity,
 * order) over the host's inherited text properties.
 */
function cascadePseudoDecls(matched, hostStyle) {
  const winners = new Map();
  const scoreOf = (d, rule) => [d.important ? 1 : 0, ...(rule.specificity || [0, 0, 0, 0]), rule.order || 0];
  const cmpScore = (a, b) => {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const d = (a[i] || 0) - (b[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  for (const rule of matched || []) {
    for (const d of rule.declarations || []) {
      const s = scoreOf(d, rule);
      const cur = winners.get(d.name);
      if (!cur || cmpScore(s, cur.score) >= 0) winners.set(d.name, { value: d.value, score: s });
    }
  }
  const out = {};
  for (const k of ["font-size", "font-family", "font-weight", "font-style", "color", "line-height"]) {
    if (hostStyle[k] != null) out[k] = hostStyle[k];
  }
  for (const [name, w] of winners) out[name] = w.value;
  return out;
}

// ---------------------------------------------------------------------------
// list markers
// ---------------------------------------------------------------------------

const UNORDERED_GLYPHS = { disc: "•", circle: "○", square: "▪" };
const KNOWN_TYPES = new Set([
  "disc", "circle", "square", "decimal", "decimal-leading-zero",
  "lower-roman", "upper-roman", "lower-alpha", "upper-alpha",
  "lower-greek", "none",
]);

/** Parse the `list-style` shorthand for a type / position / image token. */
function parseListStyleShorthand(value) {
  const out = { type: "", position: "", image: "" };
  for (const tok of String(value || "").split(/\s+/).filter(Boolean)) {
    const low = tok.toLowerCase();
    if (low === "inside" || low === "outside") out.position = low;
    else if (/^url\(/i.test(tok)) out.image = tok;
    else if (low === "none") { /* ambiguous: keep scanning */ }
    else if (KNOWN_TYPES.has(low)) out.type = low;
  }
  return out;
}

function toRoman(n) {
  if (!Number.isFinite(n) || n < 1) return String(Math.trunc(n) || 0);
  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let num = Math.trunc(n);
  let out = "";
  for (const [v, s] of table) while (num >= v) { out += s; num -= v; }
  return out;
}

function toAlpha(n, upper) {
  if (!Number.isFinite(n) || n < 1) return String(Math.trunc(n) || 0);
  let num = Math.trunc(n);
  let out = "";
  while (num > 0) { num--; out = String.fromCharCode(97 + (num % 26)) + out; num = Math.floor(num / 26); }
  return upper ? out.toUpperCase() : out;
}

const GREEK = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"];
function toGreek(n) {
  if (!Number.isFinite(n) || n < 1 || n > 24) return String(Math.trunc(n) || 0);
  return GREEK[Math.trunc(n) - 1];
}

/** Marker text for a list-style-type + 1-based ordinal. */
export function markerText(type, n) {
  switch (String(type || "").toLowerCase()) {
    case "disc":
    case "circle":
    case "square":
      return UNORDERED_GLYPHS[String(type).toLowerCase()] || "•";
    case "decimal":
      return `${n}.`;
    case "decimal-leading-zero":
      return `${String(n).padStart(2, "0")}.`;
    case "lower-roman":
      return `${toRoman(n).toLowerCase()}.`;
    case "upper-roman":
      return `${toRoman(n)}.`;
    case "lower-alpha":
      return `${toAlpha(n, false)}.`;
    case "upper-alpha":
      return `${toAlpha(n, true)}.`;
    case "lower-greek":
      return `${toGreek(n)}.`;
    default:
      return `${n}.`;
  }
}

/**
 * 1-based ordinal of an <li> among its sibling <li>s.
 * Honors <ol start="N"> and <ol reversed>.
 */
export function liOrdinal(li) {
  const parent = li && li.parentNode;
  if (!parent || parent.nodeType !== 1) return 1;
  const items = (parent.children || []).filter((c) => c && c.nodeType === 1 && c.localName === "li");
  const idx = items.indexOf(li);
  if (idx < 0) return 1;
  let start = 1;
  try {
    const raw = parent.getAttribute ? parent.getAttribute("start") : null;
    if (raw != null && raw !== "") { const v = parseInt(String(raw), 10); if (Number.isFinite(v)) start = v; }
  } catch { /* keep default */ }
  let reversed = false;
  try {
    reversed = parent.hasAttribute ? parent.hasAttribute("reversed") : false;
  } catch { /* keep false */ }
  if (reversed) return start + (items.length - 1 - idx);
  return start + idx;
}

/**
 * Cascaded ::marker color for an li.
 * Returns { color, fromAuthor } — fromAuthor is true when an author
 * ::marker rule set the color (vs falling back to the li's own color).
 */
function markerColorFor(li, rules) {
  const host = (li && li.computedStyle) || {};
  let matched = null;
  try {
    matched = matchPseudoRules(li, "marker", rules);
  } catch {
    matched = null;
  }
  if (matched && matched.length) {
    const cascaded = cascadePseudoDecls(matched, host);
    if (cascaded.color) return { color: cascaded.color, fromAuthor: true };
  }
  return { color: host.color || "#000", fromAuthor: false };
}

/**
 * Synthesize the default ::marker descriptor for an <li>.
 * Returns null when no marker should render (list-style-type: none, or the
 * author supplied an explicit ::marker { content } box).
 */
export function markerForLi(li, rules) {
  if (!li || li.nodeType !== 1 || li.localName !== "li") return null;
  // An explicit author ::marker with content is materialized as a real box by
  // the pseudo-element pass — don't double-render a default marker.
  try {
    const explicit = matchPseudoRules(li, "marker", rules) || [];
    for (const rule of explicit) {
      for (const d of rule.declarations || []) {
        if (String(d.name).toLowerCase() === "content") {
          const v = String(d.value || "").trim().toLowerCase();
          if (v && v !== "none" && v !== "normal") return null;
        }
      }
    }
  } catch { /* fall through to default marker */ }
  const style = li.computedStyle || {};
  const short = parseListStyleShorthand(style["list-style"]);
  let type = String(style["list-style-type"] || "").trim().toLowerCase() || short.type;
  if (!type) {
    const p = li.parentNode;
    const pname = p && p.nodeType === 1 ? p.localName : "";
    type = pname === "ol" ? "decimal" : "disc";
  }
  if (type === "none") return null;
  const image = String(style["list-style-image"] || "").trim() || short.image;
  const hasImage = image && image.toLowerCase() !== "none";
  const position = String(style["list-style-position"] || "").trim().toLowerCase() || short.position || "outside";
  const n = liOrdinal(li);
  const text = hasImage ? "◆" : markerText(type, n);
  const { color, fromAuthor } = markerColorFor(li, rules);
  const markerStyle = {
    "font-size": style["font-size"] || "14px",
    "font-family": style["font-family"] || "sans-serif",
    "font-weight": style["font-weight"] || "400",
    "font-style": style["font-style"] || "normal",
    "line-height": style["line-height"] || "",
    // list-style-image can't fetch in a static snapshot: the replacement
    // marker is visibly styled (accent) unless the author colored ::marker.
    color: hasImage && !fromAuthor ? "#0284c7" : color,
  };
  return { text, style: markerStyle, position, imageFallback: hasImage };
}
