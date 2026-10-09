// B"H
/**
 * @file cascade.js
 * @description Correct CSS cascade engine for Merkava's software renderer.
 *
 * Built on the executor-owned standards in merkava-browser/standards/css:
 *  - CssRuleCompiler: real declaration parsing (!important), @media/@layer/@supports,
 *    and proper [inline, ids, classes, types] specificity tuples.
 *  - CssCascade: important-first, specificity, source-order ranking, plus
 *    inherit/unset/initial handling and inherited-property propagation.
 *
 * This module adapts those standards to the software renderer's plain-object
 * DOM nodes, adds shorthand expansion with important-awareness, var()
 * resolution, and the renderer's viewport/body defaults.
 */
import compilerPkg from "../../../merkava-browser/standards/css/CssRuleCompiler.js";
import ruleParserPkg from "../../../merkava-browser/standards/css/CssRuleParser.js";
import selectorListPkg from "../../../merkava-browser/standards/css/CssSelectorList.js";
import ruleIndexPkg from "../../../merkava-browser/standards/css/CssRuleIndex.js";
import matcherPkg from "../../../merkava-browser/standards/css/CssSelectorMatcher.js";
import conditionsPkg from "../../../merkava-browser/standards/css/CssConditionEvaluator.js";
import specificityPkg from "../../../merkava-browser/standards/css/CssSpecificity.js";
import inheritedPkg from "../../../merkava-browser/standards/css/CssInheritedProperties.js";

const { compileCssStyleSheet, declarationsFromObject } = compilerPkg;
const { parseCssRules } = ruleParserPkg;
const { splitSelectorList } = selectorListPkg;
const { buildCssRuleIndex, cssRuleCandidates, matchesIndexedCssRule } = ruleIndexPkg;
const { elementKeys } = matcherPkg;
const { matchesMediaQuery, matchesSupportsCondition } = conditionsPkg;
const { compareSpecificity } = specificityPkg;
const { isInheritedCssProperty } = inheritedPkg;


/* ------------------------------------------------------------------ */
/* Rule index (B"H 2026-10-09): shared Chrome-style candidate filtering  */
/* from standards/css/CssRuleIndex.js. Cached per rules-array identity   */
/* in a WeakMap, so stylesheets compiled once pay the indexing cost once.*/
/* ------------------------------------------------------------------ */

const ruleIndexCache = new WeakMap();

/** Returns the cached rule index for one rules array, building it on first use. */
export function getRuleIndex(rules) {
  let index = ruleIndexCache.get(rules);
  if (!index) {
    index = buildCssRuleIndex(rules);
    ruleIndexCache.set(rules, index);
  }
  return index;
}

/** Candidate rules for one element (shared index). Exported for testing. */
export function candidateRulesFor(index, node) {
  return cssRuleCandidates(index, node);
}

/* B"H 2026-10-09 (render-bench): cascade memoization. Three per-element
 * recomputations eliminated:
 * 1. elementKeys(node) ran once per CANDIDATE RULE per element (class split
 *    each time) — cache per node.
 * 2. inheritLayeredDefaults(parentStyle) refiltered the parent's full
 *    computed style for every child — cache per parent computed object.
 * 3. uaDefaultStyles spread ({...defs}) per element — cache per tag. */
const ELEMENT_KEYS_CACHE = new WeakMap();
function cachedElementKeys(node) {
  let k = ELEMENT_KEYS_CACHE.get(node);
  if (!k) {
    k = elementKeys(node);
    ELEMENT_KEYS_CACHE.set(node, k);
  }
  return k;
}
const INHERITED_SUBSET_CACHE = new WeakMap();
function cachedInheritDefaults(parentStyle) {
  if (!parentStyle || typeof parentStyle !== "object") return inheritLayeredDefaults(parentStyle);
  let s = INHERITED_SUBSET_CACHE.get(parentStyle);
  if (!s) {
    s = inheritLayeredDefaults(parentStyle);
    INHERITED_SUBSET_CACHE.set(parentStyle, s);
  }
  return s;
}
const UA_SPREAD_CACHE = new Map();
function cachedUaDefaults(node) {
  const tag = String(node && node.localName || "").toLowerCase();
  let d = UA_SPREAD_CACHE.get(tag);
  if (d === undefined) {
    const defs = UA_DEFAULT_STYLES[tag];
    d = defs ? { ...defs } : null;
    UA_SPREAD_CACHE.set(tag, d);
  }
  return d ? { ...d } : {};
}

/** Tests one indexed rule (shared index). Exported for testing. */
export function matchesIndexedRule(node, rule, index) {
  return matchesIndexedCssRule(node, rule, index, cachedElementKeys(node));
}


/* ------------------------------------------------------------------ */
/* UA default stylesheet (B"H 2026-10-09). Browser-default styles for   */
/* HTML elements, per the HTML spec's rendering section. These have the */
/* LOWEST cascade priority: they seed the computed style before         */
/* inherited and author declarations, so any author rule overrides them.*/
/* Without these, h1 renders at body size (the "thin strip" bug).       */
/* ------------------------------------------------------------------ */

const UA_DEFAULT_STYLES = {
  h1: { "font-size": "32px", "font-weight": "bold", "margin-top": "21px", "margin-bottom": "21px" },
  h2: { "font-size": "24px", "font-weight": "bold", "margin-top": "20px", "margin-bottom": "20px" },
  h3: { "font-size": "19px", "font-weight": "bold", "margin-top": "19px", "margin-bottom": "19px" },
  h4: { "font-size": "16px", "font-weight": "bold", "margin-top": "21px", "margin-bottom": "21px" },
  h5: { "font-size": "13px", "font-weight": "bold", "margin-top": "22px", "margin-bottom": "22px" },
  h6: { "font-size": "11px", "font-weight": "bold", "margin-top": "26px", "margin-bottom": "26px" },
  p: { "margin-top": "16px", "margin-bottom": "16px" },
  ul: { "margin-top": "16px", "margin-bottom": "16px", "padding-left": "40px", "list-style-type": "disc" },
  ol: { "margin-top": "16px", "margin-bottom": "16px", "padding-left": "40px", "list-style-type": "decimal" },
  li: { "display": "list-item" },
  dl: { "margin-top": "16px", "margin-bottom": "16px" },
  dd: { "margin-left": "40px" },
  blockquote: { "margin-top": "16px", "margin-bottom": "16px", "margin-left": "40px", "margin-right": "40px" },
  figure: { "margin-top": "16px", "margin-bottom": "16px", "margin-left": "40px", "margin-right": "40px" },
  pre: { "font-family": "monospace", "white-space": "pre", "margin-top": "16px", "margin-bottom": "16px" },
  code: { "font-family": "monospace" },
  kbd: { "font-family": "monospace" },
  samp: { "font-family": "monospace" },
  b: { "font-weight": "bold" },
  strong: { "font-weight": "bold" },
  i: { "font-style": "italic" },
  em: { "font-style": "italic" },
  u: { "text-decoration": "underline" },
  s: { "text-decoration": "line-through" },
  small: { "font-size": "0.83em" },
  sub: { "font-size": "0.83em", "vertical-align": "sub" },
  sup: { "font-size": "0.83em", "vertical-align": "super" },
};

/** UA defaults for a node by tag name. Returns {} for unknown tags. */
function uaDefaultStyles(node) {
  const tag = String(node && node.localName || "").toLowerCase();
  const defs = UA_DEFAULT_STYLES[tag];
  return defs ? { ...defs } : {};
}

/** Compile a stylesheet into cascade-ready rules with deterministic order. */
export function compileStylesheet(cssText, environment = {}, orderStart = 0) {
  const clean = String(cssText || "").replace(/\/\*[\s\S]*?\*\//g, "");
  const compiled = compileCssStyleSheet(clean, environment, orderStart);
  // B"H 2026-10-09: tag every rule with its cascade-layer key (null =
  // unlayered). Falls back to all-unlayered on any structural mismatch.
  const layerKeys = annotateLayerKeys(clean, environment, compiled.rules.length);
  return {
    rules: compiled.rules.map((rule, i) => ({
      ...rule,
      layerKey: layerKeys ? layerKeys[i] : null,
      declarations: expandDeclarations(rule.declarations),
    })),
    // B"H 2026-10-09: @container rules ride along for per-element
    // evaluation in applyCascade (domLayout.js).
    containerRules: compiled.containerRules || [],
    // B"H 2026-10-09: @property registrations (math-env-property batch).
    // Fix-forward: the registrar hasn't landed yet — keep the field without
    // crashing the cascade until it does.
    properties:
      typeof parsePropertyRegistrations === "function" ? parsePropertyRegistrations(compiled.atRules) : undefined,
    nextOrder: compiled.nextOrder,
  };
}

/** Parse an inline style="" attribute into declaration entries. */
export function parseInlineStyle(styleAttr) {
  const text = String(styleAttr || "").trim();
  if (!text) return [];
  const compiled = compileCssStyleSheet(`x{${text}}`, {}, 0);
  const first = compiled.rules[0];
  return first ? expandDeclarations(first.declarations) : [];
}

/** Declarations from a plain {prop: value} object (snapshot.dom inline styles). */
export function inlineDeclarationsFromObject(styleObj) {
  return expandDeclarations(declarationsFromObject(styleObj));
}

/**
 * Compute the final style map for one element node.
 * parentsFirst: caller must process ancestors before descendants so that
 * parentComputed carries inherited (and custom) properties.
 */
export function computeElementStyle(node, rules, parentComputed = {}, propertyRegs = {}) {
  const inline = [
    ...inlineDeclarationsFromObject(node.style || {}),
    ...parseInlineStyle(node.attributes?.style || ""),
  ];
  // B"H 2026-10-09: local cascade with origin ranks + @layer ordering
  // (the shared CssCascade predates layer support).
  const computed = cascadeWithLayers(node, rules, parentComputed, inline);
  // B"H 2026-10-09: @property — initial-value, inherits flag, syntax check.
  applyPropertyRegistrations(computed, parentComputed, propertyRegs);
  resolveVarsInPlace(computed, computed);
  // B"H 2026-10-09: env() with fallback (safe-area insets are 0px here).
  evaluateEnvsInPlace(computed);
  // B"H: var-bearing shorthands were kept raw at compile time (tokens like
  // var(--w) cannot be classified until substitution). Expand them now that
  // values are final, then evaluate any calc() expressions.
  expandResolvedShorthandsInPlace(computed);
  evaluateCalcsInPlace(computed);
  // B"H 2026-10-09: min()/max()/clamp() without % resolve here; %-bearing
  // forms defer to layout's dim(), which knows the containing block.
  evaluateMathInPlace(computed);
  applyViewportDefaults(node, computed);
  return computed;
}

/** Body/viewport defaults. Respects `background` shorthand (the old code did not). */
function applyViewportDefaults(node, computed) {
  if (node.localName !== "body") return;
  const hasBg = computed["background-color"] != null || computed.background != null;
  if (!hasBg) {
    // B"H 2026-10-09: Light theme defaults like real browsers (was dark).
    computed["background-color"] = "#ffffff";
    if (computed.color == null) computed.color = "#1e293b";
  }
  if (computed.margin == null) computed.margin = "0";
}

/* ------------------------------------------------------------------ */
/* Cascade layers (@layer) + origin/importance ranking.                 */
/* B"H 2026-10-09, additive. CssRuleCompiler inlines @layer blocks      */
/* without recording layer membership, so layered rules previously      */
/* competed as unlayered. This pass re-walks the same parsed rules      */
/* (same parser, same @media/@supports gating) and tags each compiled  */
/* rule with a layer key: null = unlayered, otherwise the path of       */
/* child-indices from the layer tree root.                              */
/* ------------------------------------------------------------------ */

/** Tag each compiled rule with its cascade-layer key. Returns null on any
 * structural mismatch (the caller then treats every rule as unlayered —
 * never a wrong winner, just the pre-layer behavior). */
function annotateLayerKeys(cleanCss, environment, ruleCount) {
  try {
    const keys = [];
    const roots = [];
    const stack = [];
    let anon = 0;
    const topNode = () => (stack.length ? stack[stack.length - 1] : null);
    const declareLayer = (name) => {
      const parent = topNode();
      const sibs = parent ? parent.children : roots;
      let node = sibs.find((n) => n.name === name);
      if (!node) {
        node = { name, parent, children: [], childIndex: sibs.length };
        sibs.push(node);
      }
      return node;
    };
    const pathOf = (node) => {
      const path = [];
      for (let n = node; n; n = n.parent) path.unshift(n.childIndex);
      return path;
    };
    const splitLayerNames = (prelude) =>
      String(prelude || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const walk = (parsedRules) => {
      for (const rule of parsedRules) {
        if (rule.kind === "qualified") {
          // Same selector splitting as the compiler: one compiled rule per
          // selector, so indices align 1:1 with compiled.rules.
          const n = splitSelectorList(rule.prelude).length;
          const node = topNode();
          const key = node ? pathOf(node) : null;
          for (let i = 0; i < n; i++) keys.push(key);
          continue;
        }
        if (rule.name === "layer") {
          const names = splitLayerNames(rule.prelude);
          const hasBlock = rule.block != null && String(rule.block).trim() !== "";
          if (!hasBlock) {
            // `@layer a, b;` (or an empty block): declare order only.
            for (const nm of names) declareLayer(nm);
            continue;
          }
          let node;
          if (!names.length) {
            // Anonymous layer: every occurrence is its own layer.
            node = declareLayer(`\u0000anon${anon++}`);
          } else {
            for (const nm of names) declareLayer(nm);
            // `@layer a, b { }`: rules go to the LAST named layer.
            node = declareLayer(names[names.length - 1]);
          }
          stack.push(node);
          walk(parseCssRules(rule.block));
          stack.pop();
          continue;
        }
        if (rule.name === "media" && rule.block) {
          if (matchesMediaQuery(rule.prelude, environment)) walk(parseCssRules(rule.block));
          continue;
        }
        if (rule.name === "supports" && rule.block) {
          if (matchesSupportsCondition(rule.prelude, environment)) walk(parseCssRules(rule.block));
          continue;
        }
        // Any other at-rule: the compiler skips its block too.
      }
    };
    walk(parseCssRules(cleanCss));
    if (keys.length !== ruleCount) return null;
    return keys;
  } catch {
    return null;
  }
}

/* Origin ranks per CSS Cascade 5: important inline (style attribute) >
 * important author > normal inline > normal author. (UA/user origins are
 * renderer defaults applied separately and always lose to author
 * declarations, so they need no rank here.) */
const ORIGIN_AUTHOR_NORMAL = 4;
const ORIGIN_INLINE_NORMAL = 5;
const ORIGIN_AUTHOR_IMPORTANT = 7;
const ORIGIN_INLINE_IMPORTANT = 8;

/** Compare two layer paths; >0 means `a` wins. Normal declarations: the
 * later-declared layer wins, and a nested layer sorts directly after its
 * parent (deeper wins on a shared prefix). !important reverses both. */
function compareLayerPaths(a, b, important) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return important ? b[i] - a[i] : a[i] - b[i];
  }
  return important ? b.length - a.length : a.length - b.length;
}

/** Full cascade comparison: origin/importance, then layer, then
 * specificity, then source order. */
function compareCascadeCandidates(left, right) {
  if (left.originRank !== right.originRank) return left.originRank - right.originRank;
  const important = left.originRank >= ORIGIN_AUTHOR_IMPORTANT;
  const a = left.layerKey;
  const b = right.layerKey;
  if (a || b) {
    // Unlayered normal beats all layered normal; unlayered !important
    // loses to all layered !important.
    if (!a) return important ? -1 : 1;
    if (!b) return important ? 1 : -1;
    const lc = compareLayerPaths(a, b, important);
    if (lc) return lc;
  }
  if (left.specificity[0] !== right.specificity[0]) return left.specificity[0] - right.specificity[0];
  const sp = compareSpecificity(left.specificity.slice(1), right.specificity.slice(1));
  if (sp) return sp;
  return left.order - right.order;
}

/** Element cascade with layers + inline-style origins. Mirrors the shared
 * CssCascade (inheritance, CSS-wide keywords) with layer ordering added. */
function cascadeWithLayers(node, rules, parentStyle = {}, inline = []) {
  const winners = new Map();
  // B"H 2026-10-09 (mass-test batch 2): revert-layer rolls back to the
  // previous cascade layer — its candidates are tracked separately so the
  // rollback target (best declaration from a strictly lower layer) can be
  // resolved after the normal cascade.
  const revertLayerWinners = new Map();
  const consider = (map, declaration, specificity, order, layerKey, originRank) => {
    const current = map.get(declaration.name);
    const candidate = { declaration, specificity, order, layerKey, originRank };
    if (!current || compareCascadeCandidates(candidate, current) >= 0) map.set(declaration.name, candidate);
  };
  const feed = (declaration, specificity, order, layerKey, originRank) => {
    const map =
      String(declaration.value || "").trim().toLowerCase() === "revert-layer" ? revertLayerWinners : winners;
    consider(map, declaration, specificity, order, layerKey, originRank);
  };
  // B"H 2026-10-09: rule index — only test rules whose rightmost compound
  // could match this element (id/class/tag buckets + universal bucket),
  // using pre-tokenized selectors (no per-element selector re-parsing).
  // Same match set as scanning all rules; winners are order-independent.
  const ruleIndex = getRuleIndex(rules);
  const candidates = candidateRulesFor(ruleIndex, node);
  for (const rule of candidates) {
    if (!matchesIndexedRule(node, rule, ruleIndex)) continue;
    const layerKey = rule.layerKey || null;
    for (const declaration of rule.declarations) {
      feed(
        declaration,
        rule.specificity,
        rule.order,
        layerKey,
        declaration.important ? ORIGIN_AUTHOR_IMPORTANT : ORIGIN_AUTHOR_NORMAL
      );
    }
  }
  for (const declaration of inline || []) {
    feed(
      declaration,
      [1, 0, 0, 0],
      Number.MAX_SAFE_INTEGER,
      null,
      declaration.important ? ORIGIN_INLINE_IMPORTANT : ORIGIN_INLINE_NORMAL
    );
  }
  // B"H 2026-10-09: seed UA defaults first (lowest priority), then
  // inherited properties override UA, then author winners override both.
  // B"H 2026-10-09 (render-bench): cached UA spread + cached inherited subset.
  const out = { ...cachedUaDefaults(node), ...cachedInheritDefaults(parentStyle) };
  for (const [name, winner] of winners) applyLayeredWinner(out, parentStyle, name, winner.declaration.value);
  for (const [name, rw] of revertLayerWinners) {
    const w = winners.get(name);
    if (w && isStrictlyLowerLayer(w, rw)) {
      applyLayeredWinner(out, parentStyle, name, w.declaration.value);
    } else {
      // B"H: no previous layer — revert-layer falls back to revert, which
      // with a single origin behaves as unset (documented in key-06).
      applyLayeredWinner(out, parentStyle, name, "unset");
    }
  }
  return out;
}

/** Is candidate `a` in a strictly lower cascade layer than the revert-layer
 * declaration `b`? Rollback stays within the declaration's origin rank;
 * layer order mirrors compareCascadeCandidates (unlayered normal beats all
 * layered normal; layered !important beats unlayered !important). */
function isStrictlyLowerLayer(a, b) {
  if (a.originRank !== b.originRank) return false;
  const important = b.originRank >= ORIGIN_AUTHOR_IMPORTANT;
  const ak = a.layerKey;
  const bk = b.layerKey;
  if (!ak && !bk) return false;
  if (!important) {
    if (!ak) return false;
    if (!bk) return true;
    return compareLayerPaths(ak, bk, false) < 0;
  }
  if (!ak) return true;
  if (!bk) return false;
  return compareLayerPaths(ak, bk, true) < 0;
}

function inheritLayeredDefaults(parentStyle) {
  const out = Object.create(null);
  for (const [name, value] of Object.entries(parentStyle || {})) {
    if (isInheritedCssProperty(name)) out[name] = value;
  }
  return out;
}

function applyLayeredWinner(out, parentStyle, name, value) {
  const normalized = String(value || "").trim();
  if (normalized === "inherit") {
    if (Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
    else delete out[name];
    return;
  }
  if (normalized === "unset") {
    if (isInheritedCssProperty(name) && Object.prototype.hasOwnProperty.call(parentStyle, name))
      out[name] = parentStyle[name];
    else delete out[name];
    return;
  }
  if (normalized === "initial" || normalized === "revert" || normalized === "revert-layer") {
    delete out[name];
    return;
  }
  out[name] = value;
}

/** Resolve var(--name, fallback) references against the element's own map. */
export function resolveVarsInPlace(computed, vars) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value === "string" && value.includes("var(")) {
      // B"H: only custom properties keep the cyclic sentinel; regular
      // properties collapse cyclic-invalid to "" (invalid declaration),
      // exactly as before, so no sentinel ever leaks into layout/paint.
      computed[name] = resolveVarValue(value, vars, [], name.startsWith("--"));
    }
  }
}

// B"H: sentinel marking a custom property "invalid at computed-value time"
// (cyclic dependency). Per CSS Custom Properties L1, var(--x, fallback)
// referencing such a property must substitute the fallback — so the cyclic
// state must survive eager in-place resolution of the custom property itself.
const VAR_CYCLIC = "\u0000var-cyclic\u0000";

function resolveVarValue(value, vars, seen, forCustomProp = false) {
  const r = resolveVarInner(String(value), vars, seen);
  if (!r.cyclic) return r.value;
  // B"H: cyclic custom properties stay marked invalid-at-computed-value-time
  // so var(--x, fallback) can substitute the fallback per spec.
  return forCustomProp ? VAR_CYCLIC : "";
}

function resolveVarInner(value, vars, seen) {
  let out = String(value);
  for (let guard = 0; guard < 10; guard++) {
    const found = findVarCall(out);
    if (!found) return { value: out, cyclic: false };
    const { start, end, name, fallback } = found;
    let replacement = "";
    // A var() whose target is cyclic/invalid: use fallback, else propagate invalid.
    const useFallback = () => {
      if (fallback == null) return { value: "", cyclic: true };
      const fr = resolveVarInner(fallback, vars, seen);
      return { value: fr.value, cyclic: fr.cyclic };
    };
    let r;
    if (seen.includes(name)) {
      r = useFallback();
    } else if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const raw = String(vars[name]);
      if (raw === VAR_CYCLIC) {
        r = useFallback();
      } else {
        r = resolveVarInner(raw, vars, [...seen, name]);
        if (r.cyclic) r = useFallback();
      }
    } else {
      r = useFallback();
    }
    if (r.cyclic) return { value: "", cyclic: true };
    replacement = r.value;
    out = out.slice(0, start) + replacement + out.slice(end);
  }
  return { value: out, cyclic: false };
}

function findVarCall(text) {
  const at = text.indexOf("var(");
  if (at < 0) return null;
  let depth = 0;
  for (let i = at + 4; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      if (depth === 0) {
        const inner = text.slice(at + 4, i);
        const comma = topLevelComma(inner);
        const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
        const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
        return { start: at, end: i + 1, name, fallback };
      }
      depth--;
    }
  }
  return null;
}

function topLevelComma(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}

/** Expand shorthand declarations deferred at compile time because they
 * contained var(). Runs after var resolution, so each value is final and
 * classifies correctly (e.g. border: var(--w) solid var(--c) -> 6px solid red).
 * The cascade already picked the winning shorthand; expanding it here into
 * longhands is source-order correct. */
// B"H 2026-10-09 (mass-test batch 2): post-var() expansion runs only for
// genuine shorthands. Compile-time expansion already fanned border-width /
// border-color / border-style / margin / padding into the forms the layout
// engine and painters consume (box() reads both base and side keys;
// borderWidth()/borderColor() read the unprefixed names); re-expanding them
// here fans them into side-specific keys the painters never read, silently
// dropping every border and margin. var()-bearing longhands resolve to
// values the consumers read directly, so leaving them unexpanded is correct.
const POST_VAR_EXPANDABLE = new Set([
  "background",
  "border",
  "font",
  "flex",
  "grid-gap",
  "grid-column-gap",
  "grid-row-gap",
]);

function expandResolvedShorthandsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    if (!POST_VAR_EXPANDABLE.has(name)) continue;
    const value = computed[name];
    if (typeof value !== "string" || value.includes("var(")) continue;
    delete computed[name];
    for (const decl of expandOne({ name, value, important: false })) {
      computed[decl.name] = decl.value;
    }
  }
}

/* ------------------------------------------------------------------ */
/* calc() evaluation (additive). Runs after var() substitution so that   */
/* calc(var(--w) + 50px) resolves to a plain length the layout engine    */
/* can consume. Simple + - * / with parens; px/%/unitless only. On any   */
/* unsupported shape the value is left untouched.                        */
/* ------------------------------------------------------------------ */

function evaluateCalcsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value === "string" && value.includes("calc(")) {
      computed[name] = evaluateCalcValue(value);
    }
  }
}

function evaluateCalcValue(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    // Evaluate the last (innermost) calc() first so nesting resolves.
    const at = out.lastIndexOf("calc(");
    if (at < 0) return out;
    let depth = 0;
    let end = -1;
    for (let i = at + 5; i < out.length; i++) {
      if (out[i] === "(") depth++;
      else if (out[i] === ")") {
        if (depth === 0) {
          end = i;
          break;
        }
        depth--;
      }
    }
    if (end < 0) return out;
    const result = evaluateCalcExpr(out.slice(at + 5, end));
    if (result == null) return out;
    out = out.slice(0, at) + result + out.slice(end + 1);
  }
  return out;
}

function tokenizeCalc(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    const m = expr.slice(i).match(/^[0-9]*\.?[0-9]+([a-zA-Z%]+)?/);
    if (!m) return null;
    tokens.push({ value: parseFloat(m[0]), unit: m[1] || "" });
    i += m[0].length;
  }
  return tokens;
}

function evaluateCalcExpr(expr) {
  const tokens = tokenizeCalc(expr);
  if (!tokens || !tokens.length) return null;
  let pos = 0;
  const peek = () => tokens[pos];
  function parseExpr() {
    let left = parseTerm();
    while (left && (peek() === "+" || peek() === "-")) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = calcAddSub(left, op, right);
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    while (left && (peek() === "*" || peek() === "/")) {
      const op = tokens[pos++];
      const right = parseFactor();
      left = calcMulDiv(left, op, right);
    }
    return left;
  }
  function parseFactor() {
    const t = peek();
    if (t === "(") {
      pos++;
      const v = parseExpr();
      if (!v || peek() !== ")") return null;
      pos++;
      return v;
    }
    if (t === "-" || t === "+") {
      pos++;
      const v = parseFactor();
      if (!v) return null;
      return { value: t === "-" ? -v.value : v.value, unit: v.unit };
    }
    if (t && typeof t === "object") {
      pos++;
      return t;
    }
    return null;
  }
  const result = parseExpr();
  if (!result || pos !== tokens.length) return null;
  const rounded = Math.round(result.value * 1000) / 1000;
  return `${rounded}${result.unit}`;
}

function calcAddSub(left, op, right) {
  if (!left || !right) return null;
  // Unitless zero adopts the other side's unit; otherwise units must match.
  let unit = left.unit;
  if (left.unit !== right.unit) {
    if (left.unit === "" && left.value === 0) unit = right.unit;
    else if (right.unit === "" && right.value === 0) unit = left.unit;
    else return null;
  }
  return { value: op === "+" ? left.value + right.value : left.value - right.value, unit };
}

function calcMulDiv(left, op, right) {
  if (!left || !right) return null;
  if (op === "*") {
    if (left.unit && right.unit) return null;
    return { value: left.value * right.value, unit: left.unit || right.unit };
  }
  if (right.unit || right.value === 0) return null;
  return { value: left.value / right.value, unit: left.unit };
}

/* ------------------------------------------------------------------ */
/* env() evaluation (additive, 2026-10-09). Runs after var() so that    */
/* env() inside var() fallbacks composes. Known safe-area insets are    */
/* 0px in this software renderer (no notches); unknown names use the    */
/* fallback, or are guaranteed-invalid (declaration dropped) without.   */
/* ------------------------------------------------------------------ */

const KNOWN_ENVS = {
  "safe-area-inset-top": "0px",
  "safe-area-inset-right": "0px",
  "safe-area-inset-bottom": "0px",
  "safe-area-inset-left": "0px",
};

function evaluateEnvsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value !== "string" || value.indexOf("env(") < 0) continue;
    const result = evaluateEnvValue(value);
    if (result == null) delete computed[name];
    else computed[name] = result;
  }
}

function evaluateEnvValue(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    const at = findMathFnCall(out, "env(");
    if (at < 0) return out;
    const end = findFnEnd(out, at, 4);
    if (end < 0) return null;
    const inner = out.slice(at + 4, end);
    const comma = topLevelComma(inner);
    const varName = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    let replacement;
    if (Object.prototype.hasOwnProperty.call(KNOWN_ENVS, varName)) {
      replacement = KNOWN_ENVS[varName];
    } else if (fallback != null && fallback !== "") {
      replacement = fallback;
    } else {
      return null; // guaranteed-invalid: drop the whole declaration
    }
    out = out.slice(0, at) + replacement + out.slice(findFnEnd(out, at, 4) + 1);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* min()/max()/clamp() at cascade time (additive, 2026-10-09).          */
/* Only %-free calls resolve here (px-space, like calc); anything with */
/* a % is left raw for layout's dim(), which knows the containing block.*/
/* The (?<![\w-]) guard keeps minmax(/max-content etc. untouched.       */
/* ------------------------------------------------------------------ */

const MATH_FN_RE = /(?<![\w-])(min|max|clamp)\(/gi;

function evaluateMathInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value !== "string") continue;
    MATH_FN_RE.lastIndex = 0;
    if (!MATH_FN_RE.test(value)) continue;
    const result = evaluateMathNoPercent(value);
    if (result != null) computed[name] = result;
  }
}

function evaluateMathNoPercent(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    const found = findMathFnCallAny(out);
    if (!found) return out;
    const { at, name, end } = found;
    const inner = out.slice(at + name.length + 1, end);
    if (inner.indexOf("%") >= 0) return null; // defer to layout
    const args = splitTopLevel(inner, ",").map((a) => parseAbsoluteLength(a.trim()));
    if (!args.length || args.some((v) => v == null)) return null;
    let result;
    const fn = name.toLowerCase();
    if (fn === "min") result = Math.min(...args);
    else if (fn === "max") result = Math.max(...args);
    else {
      if (args.length !== 3) return null;
      result = Math.min(Math.max(args[1], args[0]), args[2]);
    }
    out = out.slice(0, at) + round3(result) + "px" + out.slice(end + 1);
  }
  return null;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function parseAbsoluteLength(t) {
  const m = String(t).match(/^(-?\d*\.?\d+)(px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax)?$/i);
  if (!m) return null;
  // B"H 2026-10-09 (css-worker-2): absolute units convert to px here.
  // Font/viewport-relative units (em, rem, vw, vh, ...) CANNOT resolve at
  // cascade time — the old code silently dropped the unit and used the raw
  // number (50vw -> 50). Return null so the math function defers to layout,
  // where the pre-layout relative-unit pass rewrites them to px first.
  const unit = (m[2] || "px").toLowerCase();
  const n = Number(m[1]);
  switch (unit) {
    case "px": return n;
    case "pt": return n * 96 / 72;
    case "pc": return n * 16;
    case "in": return n * 96;
    case "cm": return n * 96 / 2.54;
    case "mm": return n * 96 / 25.4;
    case "q": return n * 96 / 25.4 / 4;
    default: return null; // relative: defer
  }
}

/** Index of the balanced ")" closing the fn call at `at` (prefix length `plen`), or -1. */
function findFnEnd(text, at, plen) {
  let depth = 0;
  for (let i = at + plen; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

/** Find the LAST (innermost) min(/max(/clamp( call: {at, name, end} or null. */
function findMathFnCallAny(text) {
  MATH_FN_RE.lastIndex = 0;
  let best = null;
  let m;
  while ((m = MATH_FN_RE.exec(text)) !== null) {
    const at = m.index + m[0].length - m[1].length - 1;
    const end = findFnEnd(text, at, m[1].length + 1);
    if (end >= 0) best = { at, name: m[1], end };
  }
  return best;
}

/** Find the LAST (innermost) `prefix` call; returns its index or -1. */
function findMathFnCall(text, prefix) {
  let at = -1;
  let from = 0;
  for (;;) {
    const i = text.indexOf(prefix, from);
    if (i < 0) break;
    if (findFnEnd(text, i, prefix.length) >= 0) at = i;
    from = i + 1;
  }
  return at;
}

function splitTopLevel(text, sep) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

/* ------------------------------------------------------------------ */
/* @property registration (additive, 2026-10-09). Parsed from the       */
/* compiler's atRules (including @property nested in @layer, which the  */
/* compiler hoists into atRules). Invalid registrations (missing       */
/* syntax/inherits, missing initial-value for non-"*" syntax, or       */
/* var() in initial-value which must be computationally independent)   */
/* are ignored. Applied per element after the cascade, before var().   */
/* ------------------------------------------------------------------ */

function parsePropertyRegistrations(atRules) {
  const regs = {};
  for (const rule of atRules || []) {
    if (!rule || rule.name !== "property") continue;
    const propName = String(rule.prelude || "").trim();
    if (!/^--[\w-]+$/.test(propName)) continue;
    const desc = parseDescriptors(String(rule.block || ""));
    const syntax = desc.syntax != null ? String(desc.syntax).replace(/^["']|["']$/g, "").trim() : "";
    const inherits = desc.inherits != null ? /^\s*true\s*$/i.test(desc.inherits) : null;
    const initialValue = desc["initial-value"] != null ? String(desc["initial-value"]).trim() : "";
    if (!syntax || inherits == null) continue;
    const universal = syntax.split("|").map((s) => s.trim()) .includes("*");
    if (!universal && !initialValue) continue;
    if (initialValue.indexOf("var(") >= 0) continue; // must be computationally independent
    regs[propName] = { syntax, inherits, initialValue };
  }
  return regs;
}

function parseDescriptors(block) {
  const out = {};
  for (const part of String(block).split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const key = part.slice(0, i).trim().toLowerCase();
    const val = part.slice(i + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

function applyPropertyRegistrations(computed, parentComputed, regs) {
  const names = Object.keys(regs || {});
  if (!names.length) return;
  for (const name of names) {
    const reg = regs[name];
    const has = Object.prototype.hasOwnProperty.call(computed, name);
    const parentVal = parentComputed ? parentComputed[name] : undefined;
    const specified = has && computed[name] !== parentVal;
    if (!specified) {
      // Inherits when registered inherits:true; otherwise the initial value.
      if (!(reg.inherits && has)) {
        if (reg.initialValue) computed[name] = reg.initialValue;
        else delete computed[name];
      }
      continue;
    }
    if (!valueMatchesSyntax(computed[name], reg.syntax)) {
      if (reg.initialValue) computed[name] = reg.initialValue;
      else delete computed[name];
    }
  }
}

function valueMatchesSyntax(value, syntax) {
  const v = String(value).trim();
  if (!v) return false;
  return String(syntax)
    .split("|")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .some((alt) => matchSyntaxAlt(v, alt));
}

function matchSyntaxAlt(v, alt) {
  switch (alt) {
    case "*":
      return true;
    case "<length>":
      return /^(0|-?\d*\.?\d+(px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax))$/i.test(v);
    case "<percentage>":
      return /^-?\d*\.?\d+%$/.test(v);
    case "<length-percentage>":
      return matchSyntaxAlt(v, "<length>") || matchSyntaxAlt(v, "<percentage>");
    case "<number>":
      return /^-?\d*\.?\d+$/.test(v);
    case "<integer>":
      return /^-?\d+$/.test(v);
    case "<color>":
      return isColorValue(v);
    default:
      return false;
  }
}

function isColorValue(v) {
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
  if (/^(rgba?|hsla?|color|lab|lch|oklab|oklch|light-dark)\(/i.test(v)) return true;
  return isNamedColor(v.toLowerCase());
}

/* ------------------------------------------------------------------ */
/* Shorthand expansion (important-aware).                               */
/* ------------------------------------------------------------------ */

const EXPANDABLE = new Set([
  "background",
  "border",
  "border-width",
  "border-color",
  "border-style",
  "margin",
  "padding",
  "font",
  "flex",
  "grid-gap",
  "grid-column-gap",
  "grid-row-gap",
]);

/* ------------------------------------------------------------------ */
/* CSS-wide keyword semantics (B"H 2026-10-09, mass-test batch 2, additive). */
/* ------------------------------------------------------------------ */

const CSS_WIDE_KEYWORDS = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

// B"H: `color: initial` must survive the cascade as an explicit "use the
// initial value" marker. The cascade deletes `initial` (spec-correct: the
// computed value IS the initial value), but the software painter runs a
// paint-time ancestor walk for color that would then re-inherit the parent's
// color. textFill.js recognizes this marker and uses the contrast-safe
// initial instead of walking.
export const INITIAL_COLOR_MARKER = "merkava-initial-color";

function cssWideKeyword(value) {
  const low = String(value || "").trim().toLowerCase();
  return CSS_WIDE_KEYWORDS.has(low) ? low : null;
}

/** Normalize one declaration's CSS-wide keyword value (additive pre-pass):
 * - keywords are ASCII case-insensitive: INITIAL/Inherit/etc. all work;
 * - single-origin engine: no earlier origin exists, so `revert` falls back
 *   to `unset` per spec (documented in key-05/key-10);
 * - `revert-layer` keeps its identity for the layered rollback in
 *   cascadeWithLayers;
 * - `color: initial` becomes INITIAL_COLOR_MARKER (see above). */
function normalizeKeywordDeclaration(decl) {
  const kw = cssWideKeyword(decl.value);
  if (!kw) return decl;
  let value = kw;
  if (kw === "revert") value = "unset";
  if (String(decl.name || "").toLowerCase() === "color" && kw === "initial") value = INITIAL_COLOR_MARKER;
  return value === decl.value ? decl : { ...decl, value };
}

// B"H: property list reset by the `all` shorthand (CSS-wide keywords only).
// Inherited names mirror merkava-browser/standards/css/CssInheritedProperties.js
// minus direction/unicode-bidi, which `all` never resets per spec; the rest
// are non-inherited properties the software renderer consumes. Custom
// properties (--*) are excluded per spec.
const ALL_RESET_PROPERTIES = [
  "color", "cursor", "font-family", "font-feature-settings", "font-kerning",
  "font-size", "font-stretch", "font-style", "font-variant", "font-weight",
  "letter-spacing", "line-height", "list-style-image", "list-style-position",
  "list-style-type", "quotes", "text-align", "text-indent", "text-transform",
  "visibility", "white-space", "word-spacing", "writing-mode",
  "background-color", "background-image",
  "border-width", "border-style", "border-color",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "display", "position", "top", "right", "bottom", "left",
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "overflow", "overflow-x", "overflow-y", "float", "clear",
  "z-index", "opacity",
  "flex-grow", "flex-shrink", "flex-basis", "flex-direction", "flex-wrap",
  "align-items", "align-content", "justify-content",
  "gap", "column-gap", "row-gap",
  "text-decoration", "text-shadow", "box-shadow", "box-sizing",
  "vertical-align", "transform", "-webkit-text-fill-color",
];

/** Expand `all: <keyword>` into per-property keyword declarations. The
 * expanded longhands participate in the cascade with the `all`
 * declaration's own specificity/order/!important, exactly as specified.
 * Each longhand goes through keyword normalization too (so `all: initial`
 * marks color with INITIAL_COLOR_MARKER, `all: revert` becomes unset, …). */
function expandAllKeyword(decl) {
  return ALL_RESET_PROPERTIES.map((name) =>
    normalizeKeywordDeclaration({ name, value: decl.value, important: !!decl.important })
  );
}

/** Shorthand expansion (important-aware). Exported for pseudo-element styling. */
export function expandDeclarations(declarations) {
  const out = [];
  for (const decl of declarations || []) {
    const n = normalizeKeywordDeclaration(decl);
    if (String(n.name || "").toLowerCase() === "all" && cssWideKeyword(n.value)) {
      out.push(...expandAllKeyword(n));
      continue;
    }
    if (!EXPANDABLE.has(n.name)) {
      out.push(n);
      continue;
    }
    out.push(...expandOne(n));
  }
  return out;
}

function expandOne(decl) {
  const { name, value, important } = decl;
  // B"H: a shorthand whose value contains var() cannot be classified at
  // compile time (e.g. splitBorder would misfile "var(--w)" as a color).
  // Per spec, var() substitution precedes shorthand parsing, so keep the
  // raw shorthand; computeElementStyle expands it after var resolution.
  if (String(value).includes("var(")) return [decl];
  const make = (n, v) => ({ name: n, value: v, important });
  // B"H 2026-10-09 (mass-test batch 2): a CSS-wide keyword on a shorthand
  // applies to every longhand the shorthand would produce (e.g.
  // border:initial == border-width:initial + border-style:initial +
  // border-color:initial). The value is already normalized (lowercase,
  // revert->unset) by normalizeKeywordDeclaration.
  if (cssWideKeyword(value)) {
    switch (name) {
      case "background":
        return [make("background-image", value), make("background-color", value)];
      case "border":
        return [make("border-width", value), make("border-style", value), make("border-color", value)];
      case "border-width":
      case "border-color":
      case "border-style":
        // B"H: keep shorthand depth — the `border:` shorthand expands to
        // border-color (not side-specific keys), so `border-color: inherit`
        // must stay border-color to find the parent's cascaded value.
        // (Side-specific border-* keys are not consumed by the painters.)
        return [decl];
      case "margin":
      case "padding":
        return ["top", "right", "bottom", "left"].map((sd) => make(`${name}-${sd}`, value));
      case "font":
        return [
          make("font-style", value),
          make("font-weight", value),
          make("font-size", value),
          make("line-height", value),
          make("font-family", value),
        ];
      case "flex":
        return [make("flex-grow", value), make("flex-shrink", value), make("flex-basis", value)];
      case "grid-gap":
        return [make("gap", value)];
      case "grid-column-gap":
        return [make("column-gap", value)];
      case "grid-row-gap":
        return [make("row-gap", value)];
      default:
        return [decl];
    }
  }
  switch (name) {
    case "background": {
      const expanded = [];
      const image = firstBackgroundImage(value);
      if (image) expanded.push(make("background-image", image));
      const color = lastColorCandidate(value);
      if (color) expanded.push(make("background-color", color));
      return expanded.length ? expanded : [decl];
    }
    case "border": {
      const { width, style, color } = splitBorder(value);
      const expanded = [];
      if (width) expanded.push(make("border-width", width));
      if (style) expanded.push(make("border-style", style));
      if (color) expanded.push(make("border-color", color));
      return expanded.length ? expanded : [decl];
    }
    case "border-width":
    case "border-color":
    case "border-style": {
      const parts = splitOutsideFunctions(value);
      if (!parts.length) return [decl];
      const [top, right = top, bottom = top, left = right] = parts;
      const base = name;
      return [
        make(`${base}-top`, top),
        make(`${base}-right`, right),
        make(`${base}-bottom`, bottom),
        make(`${base}-left`, left),
      ];
    }
    case "margin":
    case "padding": {
      const parts = splitOutsideFunctions(value);
      if (!parts.length) return [decl];
      const [top, right = top, bottom = top, left = right] = parts;
      return [
        make(`${name}-top`, top),
        make(`${name}-right`, right),
        make(`${name}-bottom`, bottom),
        make(`${name}-left`, left),
      ];
    }
    case "font": {
      const parsed = parseFontShorthand(value);
      if (!parsed) return [decl];
      const expanded = [];
      if (parsed.style) expanded.push(make("font-style", parsed.style));
      if (parsed.weight) expanded.push(make("font-weight", parsed.weight));
      expanded.push(make("font-size", parsed.size));
      if (parsed.lineHeight) expanded.push(make("line-height", parsed.lineHeight));
      expanded.push(make("font-family", parsed.family));
      return expanded;
    }
    case "flex": {
      const parts = splitOutsideFunctions(value);
      const expanded = [];
      // B"H 2026-10-09: per CSS spec, `flex: <number>` (e.g. `flex: 1`) means
      // `flex: <number> 1 0%` — an omitted flex-basis is 0%, not content-sized.
      // Without this, `flex: 1`/`flex: 2` ratios render wrong. `flex: none` is
      // `0 0 auto` and `flex: auto` is `1 1 auto`.
      if (parts.length === 1 && /^(none|auto)$/i.test(parts[0])) {
        if (/^none$/i.test(parts[0])) {
          expanded.push(make("flex-grow", "0"), make("flex-shrink", "0"), make("flex-basis", "auto"));
        } else {
          expanded.push(make("flex-grow", "1"), make("flex-shrink", "1"), make("flex-basis", "auto"));
        }
      } else {
        if (parts[0]) expanded.push(make("flex-grow", parts[0]));
        expanded.push(make("flex-shrink", parts[1] || "1"));
        expanded.push(make("flex-basis", parts[2] || "0%"));
      }
      return expanded.length ? expanded : [decl];
    }
    // B"H 2026-10-09: legacy grid-gap shorthands normalize to the modern
    // gap/column-gap/row-gap longhands the layout engine reads.
    case "grid-gap": {
      const parts = splitOutsideFunctions(value);
      return parts.length ? [make("gap", parts.join(" "))] : [decl];
    }
    case "grid-column-gap":
      return [make("column-gap", value)];
    case "grid-row-gap":
      return [make("row-gap", value)];
    default:
      return [decl];
  }
}

function splitOutsideFunctions(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  let quote = "";
  for (const ch of String(value || "")) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (/\s/.test(ch) && depth === 0) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function firstBackgroundImage(value) {
  const text = String(value || "");
  const urlAt = text.search(/url\(/i);
  const gradAt = text.search(/[a-z-]*gradient\(/i);
  const at = urlAt < 0 ? gradAt : gradAt < 0 ? urlAt : Math.min(urlAt, gradAt);
  if (at < 0) return "";
  let depth = 0;
  for (let i = at; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return text.slice(at, i + 1).trim();
    }
  }
  return "";
}

function lastColorCandidate(value) {
  const text = String(value || "");
  const matches = [
    ...text.matchAll(/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi),
    ...text.matchAll(/\brgba?\([^)]*\)/gi),
    ...text.matchAll(/\bhsla?\([^)]*\)/gi),
  ];
  const named = [...text.matchAll(/\b([a-z]+)\b/gi)]
    .map((m) => m[1])
    .filter((w) => isNamedColor(w) && !/^(url|gradient|to|repeat|solid|none|transparent)$/i.test(w));
  const all = [...matches.map((m) => ({ at: m.index, v: m[0] })), ...named.map((w) => ({ at: text.indexOf(w), v: w }))].sort(
    (a, b) => a.at - b.at
  );
  return all.length ? all[all.length - 1].v : "";
}

const NAMED_COLORS = new Set(
  ("aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blue,blueviolet,brown," +
    "coral,crimson,cyan,darkblue,darkcyan,darkgray,darkgreen,darkgrey,darkmagenta,darkorange," +
    "darkred,deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,fuchsia,gold,goldenrod," +
    "gray,green,greenyellow,grey,hotpink,indigo,ivory,khaki,lavender,lavenderblush,lawngreen," +
    "lemonchiffon,lightblue,lightcyan,lightgray,lightgreen,lightgrey,lightpink,lightskyblue," +
    "lightyellow,lime,limegreen,magenta,maroon,navy,olive,orange,orangered,orchid,pink,plum," +
    "purple,red,royalblue,salmon,silver,skyblue,teal,tomato,transparent,violet,white,whitesmoke,yellow").split(",")
);

function isNamedColor(word) {
  return NAMED_COLORS.has(String(word || "").toLowerCase());
}

function splitBorder(value) {
  let width = "";
  let style = "";
  let color = "";
  for (const token of splitOutsideFunctions(value)) {
    const low = token.toLowerCase();
    if (/^(thin|medium|thick)$/.test(low) || /^-?\d/.test(token)) width = token;
    else if (/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test(low)) style = token;
    else color = color ? `${color} ${token}` : token;
  }
  return { width, style, color };
}

const FONT_STYLES = new Set(["normal", "italic", "oblique"]);
const FONT_WEIGHTS = new Set(["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);

function parseFontShorthand(value) {
  const parts = splitOutsideFunctions(value);
  const sizeAt = parts.findIndex((p) => /^\d/.test(p) && !FONT_WEIGHTS.has(p.toLowerCase()));
  if (sizeAt < 0) return null;
  let style = "";
  let weight = "";
  for (const p of parts.slice(0, sizeAt)) {
    const low = p.toLowerCase();
    if (FONT_STYLES.has(low)) style = p;
    else if (FONT_WEIGHTS.has(low)) weight = p;
  }
  const sizePart = parts[sizeAt];
  const slash = sizePart.indexOf("/");
  const size = slash < 0 ? sizePart : sizePart.slice(0, slash);
  const lineHeight = slash < 0 ? "" : sizePart.slice(slash + 1);
  const family = parts.slice(sizeAt + 1).join(" ");
  if (!family) return null;
  return { style, weight, size, lineHeight, family };
}
