// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file cssImmediateIssues.js — CSS immediate-issues AGGREGATE action (Worker F).
 *
 * @description
 * Sits on top of Worker A's `agent/tools/chrome/cssForensics.js` and composes
 * its primitives (`traceCascade`, `scanConflicts`) into one AI-glanceable
 * issue list. This module never re-implements cascade forensics — it only
 * aggregates, cross-references, and ranks.
 *
 * Three issue categories:
 * - `conflict`: specificity wars, !important escalations, competing media
 *   queries, multiple viewport-height authorities (100vh vs 100dvh),
 *   duplicate fixed headers/docks.
 * - `missing`: UA-only styling (zero author declarations), stylesheets absent
 *   from document.styleSheets, dead @import chains, var(--name) referenced
 *   but undefined, sampled selectors matching zero elements.
 * - `trap`: hidden content (scrollHeight>clientHeight with overflow hidden),
 *   horizontal overflow, clipping under fixed overlays, zero-height text
 *   regions, giant dead regions.
 *
 * Fail-closed: when `cssForensics.js` is absent (or fails to load) the live
 * action returns `{ok:false, error:"forensics_module_missing"}` — it never
 * silently passes. The pure aggregation core (`aggregateIssues`) needs no
 * browser and is fixture-tested.
 *
 * Action name (registered by the coordinator in agent/tools/chrome/index.js):
 * `cssImmediateIssues`. Do not register here.
 */

/**
 * Defensive load of Worker A's forensics module. Never throws: when the
 * module is absent or fails to load we stay fail-closed at call time.
 * @type {object|null}
 */
let Forensics = null;
/** @type {string|null} Load error captured when the forensics module is absent. */
let forensicsLoadError = null;
try {
  // eslint-disable-next-line global-require
  Forensics = require("./cssForensics.js");
} catch (err) {
  forensicsLoadError = err && err.message ? err.message : String(err);
  Forensics = null;
}

/**
 * Whether Worker A's forensics module loaded successfully.
 * @returns {boolean} True when `traceCascade`/`scanConflicts` are callable.
 */
function forensicsAvailable() {
  return !!Forensics;
}

/** @type {Object<string, number>} Sort rank: HIGH first. */
const SEVERITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };
/** @type {Object<string, number>} Stable within-severity category order. */
const CATEGORY_RANK = { conflict: 0, missing: 1, trap: 2 };

/** @type {string[]} Layout-critical properties where !important hurts most. */
const IMPORTANT_CRITICAL_PROPS = [
  "display", "position", "float", "width", "height",
  "min-width", "max-width", "min-height", "max-height",
  "overflow", "overflow-x", "overflow-y", "top", "right", "bottom", "left",
  "z-index", "flex", "grid-template-columns", "grid-template-rows"
];

/**
 * Maps a `scanConflicts` severity to the aggregate issue severity vocabulary.
 * @param {string} s Raw severity from scanConflicts ('HIGH'|'MED'|'LOW').
 * @returns {'HIGH'|'MEDIUM'|'LOW'} Normalized severity.
 */
function mapConflictSeverity(s) {
  const v = String(s || "").toUpperCase();
  if (v === "HIGH") return "HIGH";
  if (v === "LOW") return "LOW";
  return "MEDIUM";
}

/**
 * Lexicographic comparison of CSS specificity tuples [a,b,c].
 * @param {number[]} x First specificity tuple.
 * @param {number[]} y Second specificity tuple.
 * @returns {number} Negative when x<y, positive when x>y, 0 when equal.
 */
function compareSpecificity(x, y) {
  const a = Array.isArray(x) ? x : [0, 0, 0];
  const b = Array.isArray(y) ? y : [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const d = (Number(a[i]) || 0) - (Number(b[i]) || 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * Whether two specificity tuples are "close" — the classic specificity-war
 * condition: same ID count and only a small class/element distance apart, so
 * source order (not intent) decides the winner.
 * @param {number[]} x First specificity tuple.
 * @param {number[]} y Second specificity tuple.
 * @returns {boolean} True when the tuples are near-tied.
 */
function isCloseSpecificity(x, y) {
  const a = Array.isArray(x) ? x : [0, 0, 0];
  const b = Array.isArray(y) ? y : [0, 0, 0];
  if ((Number(a[0]) || 0) !== (Number(b[0]) || 0)) return false;
  const dist =
    Math.abs((Number(a[1]) || 0) - (Number(b[1]) || 0)) +
    Math.abs((Number(a[2]) || 0) - (Number(b[2]) || 0));
  return dist <= 2;
}

/**
 * Renders a specificity tuple for human reading.
 * @param {number[]} spec Specificity tuple.
 * @returns {string} e.g. "[0,2,1]".
 */
function formatSpecificity(spec) {
  const s = Array.isArray(spec) ? spec : [0, 0, 0];
  return `[${s.map((n) => Number(n) || 0).join(",")}]`;
}

/**
 * Formats a declaration's provenance as `url:line`.
 * @param {object} decl Winning/losing declaration with sourceUrl/lineNumber.
 * @returns {string} Source reference, e.g. "mail.css:142".
 */
function formatSource(decl) {
  if (!decl) return "unknown source";
  const url = String(decl.sourceUrl || "inline/unknown");
  const short = url.split("/").pop() || url;
  return decl.lineNumber ? `${short}:${decl.lineNumber}` : short;
}

/**
 * Extracts `var(--name)` references *without* a fallback from a CSS value.
 * A var() with a fallback still computes when undefined, so it is not a
 * breakage signal.
 * @param {string} value CSS declaration value.
 * @returns {string[]} Variable names like "--accent", deduplicated.
 */
function referencedVarsWithoutFallback(value) {
  const out = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)\s*\)/g;
  const text = String(value || "");
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/**
 * Picks the `{selector, specificity, sourceUrl, lineNumber}` projection of a
 * winning declaration for the issue envelope.
 * @param {object} decl Winning declaration.
 * @returns {object} Winning projection.
 */
function pickWinning(decl) {
  return {
    selector: decl.selector,
    specificity: decl.specificity,
    sourceUrl: decl.sourceUrl,
    lineNumber: decl.lineNumber
  };
}

/**
 * Suggests a concrete fix direction for a scanConflicts finding kind.
 * @param {object} finding Raw scanConflicts finding {kind, selector, detail}.
 * @returns {string} One-line fix direction.
 */
function fixForConflictKind(finding) {
  const kind = String(finding.kind || "").toLowerCase();
  const sel = finding.selector || "the element";
  if (/specificity/.test(kind)) {
    return `decide the intended winner for ${sel} and delete or narrow the loser — do not add a third rule`;
  }
  if (/important/.test(kind)) {
    return `remove !important from the losing declaration on ${sel} — let specificity decide`;
  }
  if (/media/.test(kind)) {
    return `reconcile the competing media queries on ${sel} so exactly one value wins at every width`;
  }
  if (/viewport|100vh|dvh|height-authority/.test(kind)) {
    return `pick one viewport unit (100dvh with a 100vh fallback) for every root container — never mix vh and dvh authorities`;
  }
  if (/fixed|header|dock|sticky/.test(kind)) {
    return `keep exactly one fixed header/dock — make the other static or merge them into a single bar`;
  }
  return `resolve the conflict on ${sel}: keep the intended winner, delete the loser`;
}

/**
 * Passes scanConflicts findings through as aggregate issues.
 * @param {Array<object>} conflicts Findings {severity:'HIGH'|'MED'|'LOW', kind, selector, detail}.
 * @returns {Array<object>} Issues with category 'conflict'.
 */
function analyzeConflictFindings(conflicts) {
  return (conflicts || []).map((f) => ({
    severity: mapConflictSeverity(f.severity),
    category: "conflict",
    selector: f.selector || "(unknown)",
    detail: `[${f.kind || "conflict"}] ${f.detail || "conflicting rules detected"}`,
    fix: fixForConflictKind(f)
  }));
}

/**
 * Cross-trace specificity-war detection: the same element selector + property
 * won by different near-tied selectors with different values across sampled
 * traces — source order, not intent, is deciding.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH conflict issues.
 */
function analyzeSpecificityWars(traces) {
  const issues = [];
  const bySelectorProperty = new Map();
  for (const t of traces || []) {
    const elementSelector = t.selector || "(unknown)";
    for (const d of t.winningDeclarations || []) {
      const key = `${elementSelector}\n${d.property}`;
      if (!bySelectorProperty.has(key)) bySelectorProperty.set(key, []);
      bySelectorProperty.get(key).push({ trace: t, decl: d });
    }
  }
  for (const entries of bySelectorProperty.values()) {
    const byWinner = new Map();
    for (const e of entries) {
      if (!byWinner.has(e.decl.selector)) byWinner.set(e.decl.selector, e);
    }
    if (byWinner.size < 2) continue;
    const list = [...byWinner.values()];
    let reported = false;
    for (let i = 0; i < list.length && !reported; i++) {
      for (let j = i + 1; j < list.length && !reported; j++) {
        const a = list[i].decl;
        const b = list[j].decl;
        if (String(a.value) === String(b.value)) continue;
        if (!isCloseSpecificity(a.specificity, b.specificity)) continue;
        const winner = compareSpecificity(a.specificity, b.specificity) >= 0 ? a : b;
        const loser = winner === a ? b : a;
        issues.push({
          severity: "HIGH",
          category: "conflict",
          selector: list[i].trace.selector,
          property: a.property,
          winning: pickWinning(winner),
          overridden: {
            selector: loser.selector,
            sourceUrl: loser.sourceUrl,
            lineNumber: loser.lineNumber
          },
          detail:
            `specificity war on ${a.property}: ${winner.selector} ` +
            `${formatSpecificity(winner.specificity)} beats ${loser.selector} ` +
            `${formatSpecificity(loser.specificity)} — near-tie, source order decides`,
          fix:
            `decide the intended winner for ${a.property} on ${list[i].trace.selector} ` +
            `and delete or narrow the loser — do not add a third rule`
        });
        reported = true;
      }
    }
  }
  return issues;
}

/**
 * !important escalation detection: counts !important among winning
 * declarations and flags chains, calling out layout-critical properties.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} Conflict issues (MEDIUM, HIGH when chained).
 */
function analyzeImportantEscalations(traces) {
  const winners = [];
  for (const t of traces || []) {
    for (const d of t.winningDeclarations || []) {
      if (d.important === true) winners.push({ trace: t, decl: d });
    }
  }
  if (winners.length === 0) return [];
  const critical = winners.filter((w) =>
    IMPORTANT_CRITICAL_PROPS.includes(String(w.decl.property).toLowerCase()));
  const first = critical[0] || winners[0];
  const chained = winners.length >= 5;
  return [{
    severity: chained ? "HIGH" : "MEDIUM",
    category: "conflict",
    selector: first.trace.selector,
    property: first.decl.property,
    winning: pickWinning(first.decl),
    detail:
      `${winners.length} winning declaration(s) use !important` +
      (critical.length ? `, including layout-critical ${critical.map((w) => w.decl.property).join(", ")}` : "") +
      (chained ? " — escalation chain: authors are outbidding each other" : ""),
    fix:
      `remove !important from ${first.decl.selector}{${first.decl.property}} ` +
      `in ${formatSource(first.decl)} — let specificity decide`
  }];
}

/**
 * Competing-media-query detection: same element + property won with different
 * values under different media-query contexts across sampled traces.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} MEDIUM conflict issues.
 */
function analyzeMediaQueryConflicts(traces) {
  const issues = [];
  const bySelectorProperty = new Map();
  for (const t of traces || []) {
    for (const d of t.winningDeclarations || []) {
      const key = `${t.selector || "(unknown)"}\n${d.property}`;
      if (!bySelectorProperty.has(key)) bySelectorProperty.set(key, []);
      bySelectorProperty.get(key).push({ trace: t, decl: d });
    }
  }
  for (const entries of bySelectorProperty.values()) {
    const values = new Map();
    for (const e of entries) {
      const v = String(e.decl.value);
      if (!values.has(v)) values.set(v, e);
    }
    if (values.size < 2) continue;
    const contexts = [...values.values()].map((e) =>
      (e.decl.mediaQueries && e.decl.mediaQueries.length
        ? e.decl.mediaQueries.join(" and ")
        : "(no media query)"));
    const distinctContexts = new Set(contexts);
    if (distinctContexts.size < 2) continue;
    const first = entries[0];
    issues.push({
      severity: "MEDIUM",
      category: "conflict",
      selector: first.trace.selector,
      property: first.decl.property,
      detail:
        `competing media queries set ${first.decl.property} on ${first.trace.selector}: ` +
        [...values.keys()].map((v, i) => `"${v}" ${contexts[i]}`).join(" vs "),
      fix:
        `reconcile the media queries for ${first.decl.property} on ${first.trace.selector} ` +
        `so exactly one value wins at every width`
    });
  }
  return issues;
}

/**
 * Whether a selector targets a root-level container.
 * @param {string} selector Element selector.
 * @returns {boolean}
 */
function isRootContainerSelector(selector) {
  const s = String(selector || "");
  return /(^|[\s>+~])(html|body|:root)([\s.#:[\]]|$)/.test(s) ||
    /(^|[^\w-])(#root|#app|\.app)([^\w-]|$)/.test(s);
}

/**
 * Multiple-viewport-height-authority detection: root containers sized with a
 * mix of vh-family and dvh-family units (100vh vs 100dvh) fight over the
 * visual viewport on mobile browsers.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH conflict issues.
 */
function analyzeViewportHeightAuthorities(traces) {
  const authorities = [];
  for (const t of traces || []) {
    if (!isRootContainerSelector(t.selector)) continue;
    for (const d of t.winningDeclarations || []) {
      const prop = String(d.property || "").toLowerCase();
      if (!["height", "min-height", "max-height"].includes(prop)) continue;
      const m = String(d.value || "").match(/(\d+(?:\.\d+)?)\s*(vh|dvh|svh|lvh)\b/i);
      if (m) authorities.push({ trace: t, decl: d, unit: m[2].toLowerCase(), amount: m[1] });
    }
  }
  const units = new Set(authorities.map((a) => a.unit));
  const legacy = [...units].some((u) => u === "vh");
  const dynamic = [...units].some((u) => u === "dvh" || u === "svh" || u === "lvh");
  if (!(legacy && dynamic)) return [];
  const first = authorities[0];
  return [{
    severity: "HIGH",
    category: "conflict",
    selector: first.trace.selector,
    property: first.decl.property,
    winning: pickWinning(first.decl),
    detail:
      `multiple viewport-height authorities: ` +
      authorities.map((a) => `${a.trace.selector}{${a.decl.property}:${a.amount}${a.unit}}`).join(", ") +
      ` — vh and dvh disagree on mobile browser chrome`,
    fix: "pick one viewport unit (100dvh with a 100vh fallback) for every root container — never mix vh and dvh authorities"
  }];
}

/**
 * Duplicate fixed header/dock detection: two or more fixed-position elements
 * pinned to the same viewport edge stack on top of each other.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH conflict issues.
 */
function analyzeDuplicateFixed(traces) {
  const issues = [];
  const fixed = (traces || []).filter((t) =>
    t.computed && String(t.computed.position).toLowerCase() === "fixed");
  const atEdge = (t, edge) => {
    const v = String((t.computed && t.computed[edge]) || "").trim().toLowerCase();
    return v === "0" || v === "0px";
  };
  const topDocks = fixed.filter((t) => atEdge(t, "top"));
  const bottomDocks = fixed.filter((t) => atEdge(t, "bottom"));
  if (topDocks.length >= 2) {
    issues.push({
      severity: "HIGH",
      category: "conflict",
      selector: topDocks.map((t) => t.selector).join(", "),
      detail:
        `duplicate fixed top docks: ${topDocks.map((t) => t.selector).join(", ")} ` +
        `— ${topDocks.length} position:fixed bars pinned to top:0 will overlap`,
      fix: `keep exactly one fixed top bar (${topDocks[0].selector}) — make the other static or merge them`
    });
  }
  if (bottomDocks.length >= 2) {
    issues.push({
      severity: "HIGH",
      category: "conflict",
      selector: bottomDocks.map((t) => t.selector).join(", "),
      detail:
        `duplicate fixed bottom docks: ${bottomDocks.map((t) => t.selector).join(", ")} ` +
        `— ${bottomDocks.length} position:fixed bars pinned to bottom:0 will overlap`,
      fix: `keep exactly one fixed bottom bar (${bottomDocks[0].selector}) — make the other static or merge them`
    });
  }
  return issues;
}

/**
 * UA-only styling detection: visible elements whose matched rules contain
 * zero author declarations — the browser default is the whole design.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} MEDIUM missing issues.
 */
function analyzeAuthorlessElements(traces) {
  const issues = [];
  for (const t of traces || []) {
    const decls = t.winningDeclarations || [];
    const authorCount = decls.filter((d) => !d.origin || d.origin === "author").length;
    if (authorCount > 0) continue;
    const box = t.boundingBox || {};
    const geo = t.geometry || {};
    const visible =
      (Number(box.width) > 0 && Number(box.height) > 0) ||
      (Number(geo.clientWidth) > 0 && Number(geo.clientHeight) > 0);
    if (!visible) continue;
    if (t.computed && String(t.computed.display).toLowerCase() === "none") continue;
    issues.push({
      severity: "MEDIUM",
      category: "missing",
      selector: t.selector || "(unknown)",
      detail: `zero author declarations — ${t.selector || "element"} renders with browser-default (UA) styling only`,
      fix: `add an author rule for ${t.selector || "this element"} or confirm UA-default rendering is intentional`
    });
  }
  return issues;
}

/**
 * Stylesheet-presence detection: <link>/style nodes present in the DOM but
 * absent from document.styleSheets, plus unreadable (cross-origin) sheets.
 * @param {Array<object>} stylesheets Stylesheet survey entries.
 * @returns {Array<object>} MEDIUM/LOW missing issues.
 */
function analyzeStylesheetPresence(stylesheets) {
  const issues = [];
  for (const s of stylesheets || []) {
    if (s.inDocumentStyleSheets === false) {
      issues.push({
        severity: "MEDIUM",
        category: "missing",
        selector: "(stylesheet)",
        detail: `stylesheet linked but absent from document.styleSheets: ${s.href || "(inline)"} — its rules never apply`,
        fix: `check the <link> for ${s.href || "the inline block"} — wrong href, CSP block, or 404 keeps it out of document.styleSheets`
      });
    } else if (s.unreadable === true || s.accessError === true) {
      issues.push({
        severity: "LOW",
        category: "missing",
        selector: "(stylesheet)",
        detail: `stylesheet rules unreadable (likely cross-origin): ${s.href || "(inline)"} — forensics cannot see inside it`,
        fix: `serve ${s.href || "the stylesheet"} same-origin or add crossorigin="anonymous" with CORS headers`
      });
    }
  }
  return issues;
}

/**
 * Dead @import detection: an @import URL that never appears among loaded
 * stylesheets — the import chain is broken and its rules are missing.
 * @param {Array<object>} stylesheets Stylesheet survey entries.
 * @returns {Array<object>} MEDIUM missing issues.
 */
function analyzeDeadImports(stylesheets) {
  const issues = [];
  const loaded = new Set();
  for (const s of stylesheets || []) {
    if (s.href) loaded.add(String(s.href));
    for (const h of s.loadedHrefs || []) loaded.add(String(h));
  }
  for (const s of stylesheets || []) {
    for (const imp of s.imports || []) {
      const url = String(imp.url || "");
      const isLoaded = imp.loaded === true || loaded.has(url);
      if (!isLoaded && url) {
        issues.push({
          severity: "MEDIUM",
          category: "missing",
          selector: "(stylesheet)",
          detail: `dead @import: ${url} imported by ${s.href || "(inline)"} but never loaded — its rules are missing`,
          fix: `fix or remove the @import of ${url} in ${s.href || "the importing sheet"} — the URL 404s or is blocked`
        });
      }
    }
  }
  return issues;
}

/**
 * Undefined-CSS-variable detection: var(--name) without fallback referenced
 * in a winning declaration but absent from the :root/element variable chain —
 * the declaration computes to nothing and the style silently drops.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH missing issues.
 */
function analyzeUndefinedVars(traces) {
  const issues = [];
  const seen = new Set();
  for (const t of traces || []) {
    const vars = t.cssVariables || {};
    for (const d of t.winningDeclarations || []) {
      for (const name of referencedVarsWithoutFallback(d.value)) {
        if (Object.prototype.hasOwnProperty.call(vars, name)) continue;
        const key = `${t.selector}${d.property}${name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push({
          severity: "HIGH",
          category: "missing",
          selector: t.selector || "(unknown)",
          property: d.property,
          winning: pickWinning(d),
          detail:
            `undefined var(${name}) in winning ${d.property} on ${t.selector || "element"} ` +
            `(${formatSource(d)}) — not defined on :root or the element chain, declaration computes to nothing`,
          fix: `define ${name} on :root (or add a fallback: var(${name}, <value>)) — see ${formatSource(d)}`
        });
      }
    }
  }
  return issues;
}

/**
 * Zero-match selector detection: sampled selectors from loaded stylesheets
 * that match no element — dead CSS that misleads future edits.
 * @param {Array<object>} stylesheets Stylesheet survey entries.
 * @returns {Array<object>} LOW missing issues (capped to avoid noise).
 */
function analyzeZeroMatchSelectors(stylesheets) {
  const dead = [];
  for (const s of stylesheets || []) {
    for (const sel of s.selectors || []) {
      if (sel.matchedCount === 0 && sel.selector) {
        dead.push({ sheet: s.href || "(inline)", selector: sel.selector });
      }
    }
  }
  const shown = dead.slice(0, 8);
  const issues = shown.map((d) => ({
    severity: "LOW",
    category: "missing",
    selector: d.selector,
    detail: `selector matches zero elements: ${d.selector} in ${d.sheet} — dead rule`,
    fix: `delete ${d.selector} from ${d.sheet} or fix the selector/class name it targets`
  }));
  if (dead.length > shown.length) {
    issues.push({
      severity: "LOW",
      category: "missing",
      selector: "(stylesheets)",
      detail: `...and ${dead.length - shown.length} more zero-match selectors across loaded stylesheets`,
      fix: "sweep dead selectors from the stylesheets listed above"
    });
  }
  return issues;
}

/**
 * Hidden-content trap: scrollHeight exceeds clientHeight while overflow is
 * hidden/clip — real content exists that no user can ever scroll to.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH trap issues.
 */
function analyzeHiddenContent(traces) {
  const issues = [];
  for (const t of traces || []) {
    const geo = t.geometry || {};
    const overflow = String(
      (t.computed && (t.computed.overflowY || t.computed.overflow)) || ""
    ).toLowerCase();
    if (!/^(hidden|clip)$/.test(overflow)) continue;
    if (!(Number(geo.scrollHeight) > Number(geo.clientHeight) + 2)) continue;
    const owner = t.scrollOwner ? ` — ${t.scrollOwner} owns scroll` : "";
    issues.push({
      severity: "HIGH",
      category: "trap",
      selector: t.selector || "(unknown)",
      detail:
        `hidden content: scrollHeight ${geo.scrollHeight}px > clientHeight ${geo.clientHeight}px ` +
        `with overflow:${overflow} — content exists that cannot be scrolled to${owner}`,
      fix:
        `remove ${t.selector || "element"}{overflow:${overflow}} ` +
        `in ${formatSource((t.winningDeclarations || []).find((d) => String(d.property).toLowerCase() === "overflow-y" || String(d.property).toLowerCase() === "overflow"))}` +
        `${owner} — let the scroll owner clip, not this box`
    });
  }
  return issues;
}

/**
 * Horizontal-overflow trap: scrollWidth exceeds clientWidth — the page (or
 * box) scrolls sideways, fatal at 390px mobile widths.
 * @param {Array<object>} traces traceCascade results.
 * @param {object} viewport Viewport {width, height}.
 * @returns {Array<object>} Trap issues (HIGH on phone widths).
 */
function analyzeHorizontalOverflow(traces, viewport) {
  const issues = [];
  const phone = viewport && Number(viewport.width) <= 480;
  for (const t of traces || []) {
    const geo = t.geometry || {};
    if (!(Number(geo.scrollWidth) > Number(geo.clientWidth) + 2)) continue;
    issues.push({
      severity: phone ? "HIGH" : "MEDIUM",
      category: "trap",
      selector: t.selector || "(unknown)",
      detail:
        `horizontal overflow: scrollWidth ${geo.scrollWidth}px > clientWidth ${geo.clientWidth}px` +
        (phone ? " at phone width — sideways scroll" : ""),
      fix:
        `find the child wider than ${t.selector || "this box"} and constrain it ` +
        `(max-width:100%, overflow-wrap:anywhere) — do not just add overflow-x:hidden`
    });
  }
  return issues;
}

/**
 * Fixed-overlay clipping trap: content flagged as clipped under a fixed
 * overlay (header/dock/modal) — visible in DOM, hidden behind chrome.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH trap issues.
 */
function analyzeFixedOverlayClipping(traces) {
  const issues = [];
  for (const t of traces || []) {
    if (t.clippedByFixed !== true) continue;
    issues.push({
      severity: "HIGH",
      category: "trap",
      selector: t.selector || "(unknown)",
      detail: `content clipped under a fixed overlay — in the DOM but hidden behind fixed chrome`,
      fix: `add scroll-margin / padding equal to the fixed overlay height on ${t.selector || "this region"}`
    });
  }
  return issues;
}

/**
 * Zero-height text trap: a content region with near-zero height that still
 * contains text — collapsed box swallowing readable content.
 * @param {Array<object>} traces traceCascade results.
 * @returns {Array<object>} HIGH trap issues.
 */
function analyzeZeroHeightText(traces) {
  const issues = [];
  for (const t of traces || []) {
    const geo = t.geometry || {};
    if (!(Number(geo.clientHeight) <= 4)) continue;
    if (t.hasText !== true) continue;
    issues.push({
      severity: "HIGH",
      category: "trap",
      selector: t.selector || "(unknown)",
      detail:
        `zero-height content region (${geo.clientHeight}px) contains text — collapsed box swallowing readable content`,
      fix: `un-collapse ${t.selector || "this region"}: remove the height:0/overflow trap or the float-clearing bug collapsing it`
    });
  }
  return issues;
}

/**
 * Giant dead-region trap: a block covering >40% of the viewport with no text
 * and no background image — wasted or broken layout space.
 * @param {Array<object>} traces traceCascade results.
 * @param {object} viewport Viewport {width, height}.
 * @returns {Array<object>} MEDIUM trap issues.
 */
function analyzeGiantDeadRegions(traces, viewport) {
  const issues = [];
  const vw = Number(viewport && viewport.width) || 0;
  const vh = Number(viewport && viewport.height) || 0;
  if (!(vw > 0 && vh > 0)) return issues;
  const threshold = 0.4 * vw * vh;
  for (const t of traces || []) {
    const box = t.boundingBox || {};
    const area = Number(box.width) * Number(box.height);
    if (!(area > threshold)) continue;
    if (t.hasText === true) continue;
    const bg = String((t.computed && t.computed.backgroundImage) || "none").toLowerCase();
    if (bg !== "none" && bg !== "") continue;
    issues.push({
      severity: "MEDIUM",
      category: "trap",
      selector: t.selector || "(unknown)",
      detail:
        `giant dead region: ${Math.round(area)}px² (>${Math.round(threshold)}px², 40% of viewport) ` +
        `with no text and no background image — wasted or broken layout space`,
      fix: `inspect ${t.selector || "this region"} — collapse it, fill it, or confirm the empty state is intentional`
    });
  }
  return issues;
}

/**
 * Pure aggregation core: turns forensics-shaped inputs into a ranked,
 * AI-glanceable issue list. No browser, no network — fixture-testable.
 *
 * @param {object} input Aggregation inputs.
 * @param {Array<object>} [input.conflicts] scanConflicts findings
 *   {severity:'HIGH'|'MED'|'LOW', kind, selector, detail}.
 * @param {Array<object>} [input.traces] traceCascade results
 *   {selector, boundingBox, geometry, computed, winningDeclarations,
 *   cssVariables, scrollOwner, viewportOwners, hasText, clippedByFixed}.
 * @param {Array<object>} [input.stylesheets] Stylesheet survey entries
 *   {href, inDocumentStyleSheets, unreadable, ruleCount, imports:[{url,loaded}],
 *   selectors:[{selector, matchedCount}], loadedHrefs}.
 * @param {string} [input.commitSha] Commit the page was rendered from.
 * @param {string} [input.targetId] Chrome target inspected.
 * @param {object} [input.viewport] {width, height} of the inspected viewport.
 * @returns {object} {ok, summary:{HIGH,MED,LOW}, issues, runMeta}.
 */
function aggregateIssues(input = {}) {
  const conflicts = input.conflicts || [];
  const traces = input.traces || [];
  const stylesheets = input.stylesheets || [];
  const viewport = input.viewport || null;

  const issues = [
    ...analyzeConflictFindings(conflicts),
    ...analyzeSpecificityWars(traces),
    ...analyzeImportantEscalations(traces),
    ...analyzeMediaQueryConflicts(traces),
    ...analyzeViewportHeightAuthorities(traces),
    ...analyzeDuplicateFixed(traces),
    ...analyzeAuthorlessElements(traces),
    ...analyzeStylesheetPresence(stylesheets),
    ...analyzeDeadImports(stylesheets),
    ...analyzeUndefinedVars(traces),
    ...analyzeZeroMatchSelectors(stylesheets),
    ...analyzeHiddenContent(traces),
    ...analyzeHorizontalOverflow(traces, viewport),
    ...analyzeFixedOverlayClipping(traces),
    ...analyzeZeroHeightText(traces),
    ...analyzeGiantDeadRegions(traces, viewport)
  ];

  issues.sort((a, b) =>
    (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) ||
    (CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]));

  const summary = { HIGH: 0, MED: 0, LOW: 0 };
  for (const issue of issues) {
    if (issue.severity === "HIGH") summary.HIGH++;
    else if (issue.severity === "LOW") summary.LOW++;
    else summary.MED++;
  }

  return {
    ok: true,
    summary,
    issues,
    runMeta: {
      targetId: input.targetId || null,
      viewport,
      commitSha: input.commitSha || null,
      forensicsAvailable: forensicsAvailable(),
      tracedElements: traces.length,
      conflictFindings: conflicts.length,
      stylesheetsSurveyed: stylesheets.length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Page-side survey function. Serialized with toString() and executed via
 * Runtime.evaluate — it must stay self-contained (no closure references).
 * @returns {object} {viewport, elements, stylesheets}.
 */
function surveyPage() {
  function elementSelector(el) {
    if (el.id) return "#" + el.id;
    const parts = [];
    let node = el;
    for (let d = 0; d < 3 && node && node !== document.body; d++) {
      const tag = node.tagName.toLowerCase();
      const cls = (typeof node.className === "string"
        ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".")
        : "");
      parts.unshift(tag + (cls ? "." + cls : ""));
      node = node.parentElement;
    }
    return parts.join(" > ");
  }
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const all = Array.from(document.querySelectorAll("body *:not(script):not(style):not(noscript)"));
  const elements = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) continue;
    const cs = window.getComputedStyle(el);
    elements.push({
      selector: elementSelector(el),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      boundingBox: { x: r.x, y: r.y, width: r.width, height: r.height },
      computed: {
        display: cs.display,
        position: cs.position,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        top: cs.top,
        bottom: cs.bottom,
        backgroundImage: cs.backgroundImage
      },
      hasText: (el.innerText || "").trim().length > 0
    });
    if (elements.length >= 150) break;
  }
  const loadedHrefs = [];
  for (const sheet of document.styleSheets) {
    try { if (sheet.href) loadedHrefs.push(sheet.href); } catch (e) { /* cross-origin */ }
  }
  const stylesheets = [];
  for (const sheet of document.styleSheets) {
    const entry = {
      href: null,
      inDocumentStyleSheets: true,
      unreadable: false,
      ruleCount: 0,
      imports: [],
      selectors: [],
      loadedHrefs: loadedHrefs.slice()
    };
    try { entry.href = sheet.href || "(inline)"; } catch (e) { entry.href = "(inline)"; }
    let rules = null;
    try { rules = sheet.cssRules; } catch (e) { entry.unreadable = true; }
    if (rules) {
      const walk = (list) => {
        for (const rule of list) {
          if (rule instanceof CSSImportRule) {
            entry.imports.push({ url: rule.href, loaded: loadedHrefs.indexOf(rule.href) !== -1 });
          } else if (rule instanceof CSSStyleRule) {
            entry.ruleCount++;
            if (entry.selectors.length < 30 && rule.selectorText) {
              let matchedCount = -1;
              try { matchedCount = document.querySelectorAll(rule.selectorText).length; }
              catch (e) { matchedCount = -1; }
              entry.selectors.push({ selector: rule.selectorText, matchedCount });
            }
          } else if (rule && rule.cssRules) {
            walk(rule.cssRules);
          }
        }
      };
      try { walk(rules); } catch (e) { entry.unreadable = true; }
    }
    stylesheets.push(entry);
  }
  const linkedHrefs = new Set();
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (link.href) linkedHrefs.add(link.href);
  }
  for (const href of linkedHrefs) {
    if (loadedHrefs.indexOf(href) === -1) {
      stylesheets.push({
        href,
        inDocumentStyleSheets: false,
        unreadable: false,
        ruleCount: 0,
        imports: [],
        selectors: [],
        loadedHrefs: loadedHrefs.slice()
      });
    }
  }
  return { viewport, elements, stylesheets };
}

/**
 * Best-effort commit SHA of the repo checkout (mirrors extras.js).
 * @returns {Promise<string|null>} Full SHA or null when git is unavailable.
 */
async function gitHeadSha() {
  try {
    const { execFile } = require("node:child_process");
    const { promisify } = require("node:util");
    const execFileAsync = promisify(execFile);
    const { ROOT } = require("../../lib/config.js");
    const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: ROOT, timeout: 5000 });
    const sha = String(stdout || "").trim();
    return /^[0-9a-f]{40}$/i.test(sha) ? sha : null;
  } catch (err) {
    return null;
  }
}

/**
 * Live action handler for `cssImmediateIssues` (registered by the coordinator
 * in agent/tools/chrome/index.js — do not register here).
 *
 * Fail-closed: when Worker A's forensics module is absent the handler returns
 * `{ok:false, error:"forensics_module_missing"}` and touches nothing.
 *
 * @param {object} [payload] Action payload {targetId?, viewport?, scopeSelector?,
 *   maxElements?, port?, commitSha?, timeoutMs?}.
 * @param {object} [deps] Test seam: {forensics} overrides the required module.
 *   Pass `{forensics: null}` to deterministically exercise the fail-closed path.
 * @returns {Promise<object>} {ok, summary, issues, runMeta} or fail-closed error.
 */
async function cssImmediateIssues(payload = {}, deps = {}) {
  const F = deps.forensics !== undefined ? deps.forensics : Forensics;
  if (!F || typeof F.traceCascade !== "function" || typeof F.scanConflicts !== "function") {
    return { ok: false, error: "forensics_module_missing", loadError: forensicsLoadError };
  }

  let cdp;
  try {
    cdp = require("./cdp.js");
  } catch (err) {
    return { ok: false, error: "chrome_transport_missing", detail: err && err.message };
  }

  const timeoutMs = Math.max(1000, Math.min(Number(payload.timeoutMs) || 30000, 120000));
  const port = Number(payload.port) || 9222;
  let targetId = payload.targetId || null;
  try {
    if (!targetId && typeof cdp.currentTargetId === "function") targetId = cdp.currentTargetId();
    await cdp.ensurePage(port, { timeoutMs: Math.min(timeoutMs, 15000) });
    if (!targetId && typeof cdp.currentTargetId === "function") targetId = cdp.currentTargetId();
  } catch (err) {
    return { ok: false, error: "chrome_unavailable", detail: err && err.message };
  }

  let survey;
  try {
    const res = await cdp.cdpCall(
      "Runtime.evaluate",
      { expression: `(${surveyPage.toString()})()`, returnByValue: true },
      Math.min(timeoutMs, 20000)
    );
    survey = res && res.result && res.result.value;
  } catch (err) {
    return { ok: false, error: "survey_failed", detail: err && err.message };
  }
  if (!survey || !Array.isArray(survey.elements)) {
    return { ok: false, error: "survey_empty" };
  }

  const maxElements = Math.max(1, Math.min(Number(payload.maxElements) || 24, 60));
  const traces = [];
  let traceFailures = 0;
  for (const el of survey.elements.slice(0, maxElements)) {
    try {
      const t = await F.traceCascade({ targetId, selector: el.selector });
      if (t) {
        if (t.hasText === undefined) t.hasText = el.hasText;
        if (!t.geometry) {
          t.geometry = {
            scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
            scrollHeight: el.scrollHeight, clientHeight: el.clientHeight
          };
        }
        if (!t.boundingBox) t.boundingBox = el.boundingBox;
        if (!t.computed) t.computed = el.computed;
        traces.push(t);
      }
    } catch (err) {
      traceFailures++;
    }
  }

  let conflicts = [];
  try {
    const found = await F.scanConflicts({ targetId, scopeSelector: payload.scopeSelector || "body" });
    if (Array.isArray(found)) conflicts = found;
    else if (found && Array.isArray(found.findings)) conflicts = found.findings;
  } catch (err) {
    conflicts = [];
  }

  const commitSha = payload.commitSha || (await gitHeadSha());
  const result = aggregateIssues({
    conflicts,
    traces,
    stylesheets: survey.stylesheets || [],
    commitSha,
    targetId,
    viewport: survey.viewport
  });
  result.runMeta.traceFailures = traceFailures;
  result.runMeta.scopeSelector = payload.scopeSelector || "body";
  return { ok: true, action: "cssImmediateIssues", ...result };
}

module.exports = {
  cssImmediateIssues,
  aggregateIssues,
  forensicsAvailable,
  // Test seams (pure helpers, no browser needed):
  mapConflictSeverity,
  compareSpecificity,
  isCloseSpecificity
};
