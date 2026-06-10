// B"H
(function compilerUtil(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const COMMON_NUMS = "-1 -0.92 -0.5 -0.25 -0.1 -0.01 -0.004 0 0.004 0.01 0.02 0.05 0.1 0.25 0.5 0.75 0.92 1 1.5 1.6 2 2.4 2.5 3 3.14 6.28 10 12 14 16 18 24 28 32 90 100 180 320 560".split(" ");

  /**
   * B"H. Small shared sparks. These helpers are intentionally plain and tiny:
   * every compiler module drinks from them without dragging a giant monolith
   * back into being. Numbers also receive a common-constant lane so physics,
   * layout, animation, percentages, and UI dimensions avoid text pools.
   */
  function makePools() {
    return { text: [], sym: [], num: [], color: [], custom: [] };
  }

  function makeScope(settings, publicSymbols) {
    return { settings, publicSymbols, map: Object.create(null), next: 0 };
  }

  function childScope(scope) {
    return { settings: scope.settings, publicSymbols: scope.publicSymbols, map: Object.create(null), next: 0, parent: scope };
  }

  function ref(pool, value) {
    const text = String(value || "");
    let index = pool.indexOf(text);
    if (index < 0) index = pool.push(text) - 1;
    return index;
  }

  function builtin(list, value, custom) {
    const index = list.indexOf(value);
    return index >= 0 ? index : -(ref(custom, value) + 1);
  }

  function splitBy(value, sep) {
    const out = [];
    let part = "";
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === sep) { out.push(part); part = ""; }
      else part += value[i];
    }
    out.push(part);
    return out;
  }

  function splitSpaces(value) {
    const out = [];
    let part = "";
    for (let i = 0; i < value.length; i += 1) {
      if (isSpace(value[i])) { if (part) out.push(part); part = ""; }
      else part += value[i];
    }
    if (part) out.push(part);
    return out;
  }

  function readName(src, i) {
    let out = "";
    while (i < src.length && isName(src[i])) { out += src[i]; i += 1; }
    return { value: out, next: i };
  }

  function readUntil(src, i, target) {
    let out = "";
    while (i < src.length && src[i] !== target) { out += src[i]; i += 1; }
    return { value: trim(out), next: i };
  }

  function readQuotedOrBare(src, i) {
    const quote = src[i];
    if (quote === "'" || quote === "\"") {
      i += 1;
      let out = "";
      while (i < src.length && src[i] !== quote) { out += src[i]; i += 1; }
      return { value: out, next: i + 1 };
    }
    let out = "";
    while (i < src.length && !isSpace(src[i]) && src[i] !== ">") { out += src[i]; i += 1; }
    return { value: out, next: i };
  }

  function smallNumOrRef(value, pools) {
    const text = normalizeNumber(value);
    const common = COMMON_NUMS.indexOf(text);
    if (common >= 0) return 64 + common;
    const number = Number(text);
    if (Number.isInteger(number) && number >= 0 && number < 64) return number;
    return 128 + ref(pools.num, text);
  }

  function normalizeNumber(value) {
    const text = String(value || "0");
    const number = Number(text);
    if (!Number.isFinite(number)) return text;
    if (Object.is(number, -0)) return "0";
    return String(number);
  }

  function skipSpaces(src, i) { while (i < src.length && isSpace(src[i])) i += 1; return i; }
  function startsAt(text, part, i) { return String(text).slice(i, i + part.length) === part; }
  function endsWith(text, suffix) { const value = String(text); return value.slice(value.length - suffix.length) === suffix; }
  function lower(value) { return String(value || "").toLowerCase(); }
  function trim(value) { let a = 0, b = String(value).length; while (a < b && isSpace(value[a])) a += 1; while (b > a && isSpace(value[b - 1])) b -= 1; return String(value).slice(a, b); }
  function isSpace(ch) { return ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === "\f"; }
  function isName(ch) { return !!ch && (isAlpha(ch) || isDigit(ch) || ch === "-" || ch === "_" || ch === ":" || ch === "."); }
  function isNumber(value) { if (!value) return false; let digit = false, dot = false; for (let i = value[0] === "-" ? 1 : 0; i < value.length; i += 1) { if (value[i] === "." && !dot) { dot = true; continue; } if (!isDigit(value[i])) return false; digit = true; } return digit; }
  function isColor(value) { if (!value || value[0] !== "#" || [4, 5, 7, 9].indexOf(value.length) < 0) return false; for (let i = 1; i < value.length; i += 1) if (!isHex(value[i])) return false; return true; }
  function isAlpha(ch) { const c = ch.charCodeAt(0); return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); }
  function isDigit(ch) { const c = ch.charCodeAt(0); return c >= 48 && c <= 57; }
  function isHex(ch) { const c = ch.charCodeAt(0); return (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102); }
  function round(value) { return Math.round(value * 100) / 100; }

  Object.assign(ns, { makePools, makeScope, childScope, ref, builtin, splitBy, splitSpaces, readName, readUntil, readQuotedOrBare, smallNumOrRef, skipSpaces, startsAt, endsWith, lower, trim, isSpace, isNumber, isColor, round });
})(typeof self !== "undefined" ? self : globalThis);
