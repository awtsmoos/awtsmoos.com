//B"H

const TOKEN_RULES = {
  javascript: /\b(await|async|break|case|catch|class|const|continue|default|else|export|extends|finally|for|from|function|if|import|let|new|return|switch|throw|try|typeof|var|while|yield)\b/g,
  json: /("(?:\\.|[^"\\])*"\s*:|\btrue\b|\bfalse\b|\bnull\b|-?\b\d+(?:\.\d+)?\b)/g,
  html: /(&lt;\/?[\w:-]+|\b[\w:-]+(?==)|&gt;)/g,
  css: /([.#]?[a-zA-Z_-][\w-]*(?=\s*[:{])|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)?\b)/g,
  c: /\b(auto|break|case|char|class|const|continue|default|do|double|else|enum|float|for|if|int|long|namespace|private|protected|public|return|short|static|struct|switch|template|throw|try|void|while)\b/g
};

/**
 * Chapter 22: The Spark Remembered Its Garment.
 *
 * The Awtsmoos lets a line of code descend into the browser without becoming
 * danger. First it is escaped, stripped of teeth and fire; then small known
 * tokens are wrapped like candles in glass. This file exists as a compatible
 * shard for the render worker that asks for `processHighlightRequest`.
 *
 * @param {{firstLineToRender?: number, numLinesToRender?: number}} request
 * Defines the visible slice of lines to illuminate.
 * @param {{language?: string, lines?: string[]}} workerState
 * Carries the source lines and language mode from the caller.
 * @returns {{highlightedLines: string[]}}
 * HTML-safe highlighted lines matching the legacy worker contract.
 */
export function processHighlightRequest(request = {}, workerState = {}) {
  const lines = Array.isArray(workerState.lines) ? workerState.lines : [];
  const first = Math.max(0, Number(request.firstLineToRender) || 0);
  const count = Math.max(0, Number(request.numLinesToRender) || lines.length);
  const language = normalizeLanguage(workerState.language);
  const selected = lines.slice(first, first + count);
  return { highlightedLines: selected.map(line => highlightLine(line, language)) };
}

function normalizeLanguage(language = "") {
  const key = String(language).toLowerCase();
  if (key === "js") return "javascript";
  return TOKEN_RULES[key] ? key : "javascript";
}

function highlightLine(line = "", language = "javascript") {
  const escaped = escapeHtml(line);
  const rule = TOKEN_RULES[language] || TOKEN_RULES.javascript;
  return escaped.replace(rule, token => `<span class="awts-code-token">${token}</span>`);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
