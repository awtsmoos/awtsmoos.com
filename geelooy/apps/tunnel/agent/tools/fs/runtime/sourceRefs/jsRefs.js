// B"H
/**
 * @file jsRefs.js
 * @description
 * Chapter 104: The Import Line Found Its End Without A Semicolon.
 *
 * Static imports, re-exports, dynamic imports, and fetch calls are gathered
 * only from surface syntax. Adjacent no-semicolon imports are treated as
 * separate declarations, while strings/templates/comments stay silent.
 */
const { walkSurface, identifierAt, parseQuoted } = require("./jsLex.js");

function refsFromJs(text = "") {
  const source = String(text || "");
  return unique([
    ...staticJsRefs(source),
    ...callStringRefs(source, "import"),
    ...callStringRefs(source, "fetch")
  ]);
}

function staticJsRefs(source) {
  const refs = [];
  for (const span of importStatementSpans(source)) {
    const match = span.text.match(/\bfrom\s*["']([^"']+)["']/s) || span.text.match(/^\s*import\s*["']([^"']+)["']/s);
    if (match) refs.push(match[1]);
  }
  return refs;
}

function callStringRefs(source, name) {
  const refs = [];
  walkSurface(source, index => {
    if (!identifierAt(source, index, name)) return index + 1;
    let cursor = index + name.length;
    while (/\s/.test(source[cursor] || "")) cursor++;
    if (source[cursor] !== "(") return index + 1;
    cursor++;
    while (/\s/.test(source[cursor] || "")) cursor++;
    const parsed = parseQuoted(source, cursor);
    if (parsed) refs.push(parsed.value);
    return Math.max(index + 1, parsed?.end || cursor + 1);
  });
  return refs;
}

function importStatementSpans(source) {
  const spans = [];
  walkSurface(source, index => {
    if (!isImportDeclarationAt(source, index) && !isReexportAt(source, index)) return index + 1;
    const end = findStatementEnd(source, index);
    spans.push({ start: index, end, text: source.slice(index, end) });
    return end;
  });
  return spans;
}

function isImportDeclarationAt(source, index) {
  if (!identifierAt(source, index, "import")) return false;
  let cursor = index + 6;
  while (/\s/.test(source[cursor] || "")) cursor++;
  return source[cursor] !== "(" && source[cursor] !== ".";
}

function isReexportAt(source, index) {
  if (!identifierAt(source, index, "export")) return false;
  let cursor = index + 6;
  while (/\s/.test(source[cursor] || "")) cursor++;
  if (source[cursor] !== "*" && source[cursor] !== "{") return false;
  const end = findStatementEnd(source, index);
  return /\bfrom\s*["']/.test(source.slice(index, end));
}

function findStatementEnd(source, index) {
  let quote = "";
  let escaped = false;
  let sawFromString = false;
  for (let cursor = index; cursor < source.length; cursor++) {
    const ch = source[cursor];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) {
        quote = "";
        const text = source.slice(index, cursor + 1);
        sawFromString = /\bfrom\s*["'][^"']+["']\s*$/s.test(text) || /^\s*import\s*["'][^"']+["']\s*$/s.test(text);
      }
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === ";") return cursor + 1;
    if (ch === "\n" && sawFromString) return cursor + 1;
  }
  return source.length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

module.exports = { refsFromJs, staticJsRefs, callStringRefs, importStatementSpans };
