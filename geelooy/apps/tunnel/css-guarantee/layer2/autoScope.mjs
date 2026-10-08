//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 5 (Deploy-Time Auto-Scoping) of the Airtight CSS Guarantee System.
 * @description Two components can ship selectors that collide (e.g. two different
 * `.meluket-sefer` rules from two bundles), and browsers cache the old CSS, so
 * collisions survive deploys. At deploy time this module rewrites every selector
 * in a stylesheet to live under a unique `[data-tg="<scopeId>"]` ancestor, so
 * component styles can never leak into each other no matter what the browser
 * cached. B"H.
 *
 * Rules:
 *  - Every selector gets prefixed: `.meluket-sefer` -> `[data-tg="SCOPE"] .meluket-sefer`
 *  - Comma lists are prefixed per-selector: `.a, .b` -> `[data-tg="S"] .a, [data-tg="S"] .b`
 *  - Selectors inside @media / @supports / @container / @layer ARE scoped.
 *  - @keyframes names and their from/to blocks are NEVER touched.
 *  - `:root`, `html`, `body` selectors are left as-is (scoping them would break
 *    the document tree) and reported in `warnings`.
 *
 * Simple string manipulation (no full AST): a small brace/string/comment-aware
 * scanner walks top-level rules and recurses into conditional group rules.
 */

import { createHash } from "node:crypto";

const GLOBAL_SELECTORS_RE = /^(?::root|html|body)(?![\w-])/i;

/**
 * Generate a 6-char scope id for a CSS file: sha1 of (path + timestamp), first 6 hex chars.
 * @param {string} filePath - the CSS file path being scoped
 * @returns {string} 6-char hex scope id
 */
export function generateScopeId(filePath) {
  return createHash("sha1")
    .update(String(filePath) + Date.now())
    .digest("hex")
    .slice(0, 6);
}

/**
 * Scope every selector in `cssContent` under `[data-tg="scopeId"]`.
 * @param {string} cssContent - raw CSS text
 * @param {string} scopeId - scope id (see generateScopeId)
 * @returns {{ css: string, warnings: string[] }}
 */
export function autoScope(cssContent, scopeId) {
  const warnings = [];
  const prefix = `[data-tg="${scopeId}"]`;
  return { css: scopeBlock(cssContent, prefix, warnings), warnings };
}

/**
 * Scope all rules in a block of CSS text (a whole sheet or an at-rule body).
 */
function scopeBlock(text, prefix, warnings) {
  let out = "";
  let i = 0;
  const n = text.length;

  while (i < n) {
    const brace = indexOfCode(text, "{", i);
    if (brace === -1) {
      out += text.slice(i);
      break;
    }
    const head = text.slice(i, brace); // prelude + leading whitespace/comments
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
        // Conditional group rules: scope the selectors inside.
        out += head + "{" + scopeBlock(inner, prefix, warnings) + "}";
      } else {
        // @keyframes (incl. vendor prefixes), @font-face, @page, @import tail etc.:
        // leave the block byte-identical.
        out += head + "{" + inner + "}";
      }
    } else if (prelude === "") {
      // Stray block with no selector (shouldn't happen) — pass through.
      out += head + "{" + inner + "}";
    } else {
      out += scopePrelude(head, prefix, warnings) + "{" + inner + "}";
    }
    i = end + 1;
  }
  return out;
}

/**
 * Scope the selector prelude, preserving leading whitespace.
 */
function scopePrelude(head, prefix, warnings) {
  const m = head.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const lead = m[1];
  const trail = m[3];
  const prelude = m[2].trim();
  const scoped = splitTopLevel(prelude, ",")
    .map((sel) => scopeOneSelector(sel.trim(), prefix, warnings))
    .join(", ");
  return lead + scoped + trail;
}

/**
 * Scope one selector, or leave globals (:root/html/body) untouched with a warning.
 */
function scopeOneSelector(sel, prefix, warnings) {
  if (!sel) return sel;
  if (GLOBAL_SELECTORS_RE.test(sel)) {
    warnings.push(`Unscoped global selector left as-is: "${sel}"`);
    return sel;
  }
  return `${prefix} ${sel}`;
}

/**
 * Split `text` on `sep`, ignoring separators inside (), [], or quoted strings.
 */
function splitTopLevel(text, sep) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      cur += ch;
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
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

/**
 * Index of the next `target` char at/after `from`, skipping quoted strings and /* *\/ comments.
 */
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

/**
 * Given the index of an opening `{`, find its matching closing `}`.
 * (Assumes balanced input; falls back to end-of-text.)
 */
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
