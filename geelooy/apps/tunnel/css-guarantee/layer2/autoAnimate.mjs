//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 7 (Deploy-Time Animation Injection) of the Airtight CSS Guarantee System.
 * @description Interactive elements without transitions feel janky: a hover that
 * snaps color instantly reads as broken. At deploy time this module injects a
 * gentle default `transition` into every rule whose selector looks interactive
 * (`button`, `a`, `.btn`, `[role="button"]`) when the rule declares none, and
 * reports every `:hover` rule that has no `transform` (info-only — transforms
 * are never injected blindly). Simple string manipulation, no full AST. B"H.
 */

const DEFAULT_TRANSITION =
  "transition: color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;";

// A selector "looks interactive" when it contains the button element, the
// .btn class, the [role="button"] attribute, or a standalone `a` element
// selector (matched as a selector component, not as a stray letter).
const INTERACTIVE_RE =
  /(^|[\s>+~,])(button|a)(?![\w-])|\.btn(?![\w-])|\[role\s*=\s*["']?button["']?\]/i;

const HOVER_RE = /:hover/i;
const TRANSITION_PROP_RE = /(^|;)\s*(?:-\w+-)?transition\s*:/i;
const TRANSFORM_PROP_RE = /(^|;)\s*(?:-\w+-)?transform\s*:/i;

/**
 * Inject default transitions into interactive rules lacking them.
 *
 * @param {string} cssContent - raw CSS text
 * @returns {{ css: string, injected: number, hoverWithoutTransform: string[] }}
 *   - `css`: the CSS with transitions appended to qualifying rule bodies
 *   - `injected`: how many rules received a transition
 *   - `hoverWithoutTransform`: selectors of :hover rules declaring no transform
 */
export function injectAnimations(cssContent) {
  const state = { injected: 0, hoverWithoutTransform: [] };
  return {
    css: processBlock(cssContent, state),
    injected: state.injected,
    hoverWithoutTransform: state.hoverWithoutTransform,
  };
}

/**
 * Walk rules in a block (whole sheet or an at-rule body), injecting as we go.
 */
function processBlock(text, state) {
  let out = "";
  let i = 0;
  const n = text.length;

  while (i < n) {
    const brace = indexOfCode(text, "{", i);
    if (brace === -1) {
      out += text.slice(i);
      break;
    }
    const head = text.slice(i, brace);
    const end = findMatchingBrace(text, brace);
    const inner = text.slice(brace + 1, end);
    const prelude = head.trim();

    if (prelude.startsWith("@")) {
      const atName = prelude.split(/[\s(]/)[0].toLowerCase();
      if (
        atName === "@media" ||
        atName === "@supports" ||
        atName === "@container" ||
        atName === "@layer"
      ) {
        out += head + "{" + processBlock(inner, state) + "}";
      } else {
        // @keyframes, @font-face, @page, ... : never inject here.
        out += head + "{" + inner + "}";
      }
    } else if (prelude !== "") {
      out += head + "{" + processRule(prelude, inner, state) + "}";
    } else {
      out += head + "{" + inner + "}";
    }
    i = end + 1;
  }
  return out;
}

/**
 * Possibly inject a transition into one rule body; record hover info.
 */
function processRule(prelude, body, state) {
  const selectors = prelude.split(",").map((s) => s.trim());

  if (HOVER_RE.test(prelude) && !TRANSFORM_PROP_RE.test(";" + body)) {
    state.hoverWithoutTransform.push(prelude.trim());
  }

  if (INTERACTIVE_RE.test(prelude) && !TRANSITION_PROP_RE.test(";" + body)) {
    state.injected++;
    const trimmed = body.replace(/\s+$/, "");
    const needsSep = trimmed !== "" && !trimmed.endsWith(";");
    return body + (needsSep ? ";" : "") + " " + DEFAULT_TRANSITION;
  }
  return body;
}

/** Index of next `target` char, skipping quoted strings and comments. */
function indexOfCode(text, target, from) {
  let quote = null;
  let inComment = false;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === "/" && next === "*") {
      inComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === target) return i;
  }
  return -1;
}

/** Matching `}` for the `{` at openIdx (balanced input assumed). */
function findMatchingBrace(text, openIdx) {
  let depth = 0;
  let quote = null;
  let inComment = false;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === "/" && next === "*") {
      inComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return text.length;
}
