//B"H
import { processHighlightRequest } from "../../../../scripts/awtsmoos/coding/highlighter-logic.js";
import { escapeHtml } from "../escapeHtml.js";

const LANGUAGE_BY_EXT = {
  js: "js", mjs: "js", cjs: "js", jsx: "js", ts: "js", tsx: "js",
  html: "html", htm: "html", css: "css", json: "json",
  c: "c", h: "c", cpp: "c", cs: "c", java: "c", php: "c"
};

/**
 * Chapter 21: The File Path Lit the Letters from Within.
 *
 * The tunnel returns raw content as a river; this vessel asks the old coding
 * highlighter to read its extension, then wraps every line in a luminous span.
 * The Awtsmoos lets text remain safe HTML while still showing code structure.
 *
 * @param {string} text Raw code/text content.
 * @param {string} language Language hint or file extension.
 * @returns {string} Safe highlighted HTML when supported, escaped HTML otherwise.
 */
export function highlightedCode(text = "", language = "") {
  const mode = normalizeLanguage(language, text);
  if (!mode) return escapeHtml(text);
  try {
    return highlightWithAwtsmoos(text, mode);
  } catch {
    return escapeHtml(text);
  }
}

export function languageFromPath(path = "") {
  const ext = String(path).split(/[?#]/)[0].split(".").pop()?.toLowerCase() || "";
  return LANGUAGE_BY_EXT[ext] || "";
}

function normalizeLanguage(language = "", text = "") {
  const key = String(language).toLowerCase().replace(/^language-/, "");
  if (LANGUAGE_BY_EXT[key]) return LANGUAGE_BY_EXT[key];
  if (["javascript", "js"].includes(key)) return "js";
  if (["html", "css", "json", "c"].includes(key)) return key;
  if (/^[\s\r\n]*[\[{]/.test(text)) return "json";
  if (/^\s*</.test(text)) return "html";
  if (/\b(export|import|function|const|let|class)\b/.test(text)) return "js";
  return "";
}

function highlightWithAwtsmoos(text, language) {
  const lines = String(text).split(/\r?\n/);
  const lineStatesCache = [];
  const workerState = {
    language,
    lines,
    lineStatesCache,
    getClosestCachedState: () => ({ line: -1, state: freshState(language) })
  };
  const result = processHighlightRequest({ firstLineToRender: 0, numLinesToRender: lines.length }, workerState);
  return result.highlightedLines.join("\n");
}

function freshState(language) {
  const mode = ({ js: "javascript", html: "html", css: "css", c: "c", json: "json" })[language] || "javascript";
  return { contextStack: [{ mode }], isNextTokenFunctionName: false, inCssRuleBlock: false };
}
