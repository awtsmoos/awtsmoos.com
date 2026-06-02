// B"H
/**
 * @file jsLex.js
 * @description
 * Chapter 91: The Gatekeeper Walked Between Letters.
 *
 * The Awtsmoos gives every letter its boundary. This tiny scanner walks real
 * JavaScript surface code and skips comments, strings, template bodies, and
 * regex literals so dependency discovery hears only executable syntax.
 */

function walkSurface(source, visit) {
  let i = 0;
  let state = "normal";
  let quote = "";
  let escaped = false;
  let regexClass = false;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (state === "line") {
      if (ch === "\n") state = "normal";
      i++;
      continue;
    }

    if (state === "block") {
      if (ch === "*" && next === "/") {
        state = "normal";
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (state === "quote") {
      if (escaped) {
        escaped = false;
        i++;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        i++;
        continue;
      }
      if (ch === quote) state = "normal";
      i++;
      continue;
    }

    if (state === "regex") {
      if (escaped) {
        escaped = false;
        i++;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        i++;
        continue;
      }
      if (ch === "[") regexClass = true;
      if (ch === "]") regexClass = false;
      if (ch === "/" && !regexClass) {
        state = "normal";
        i++;
        while (/[a-z]/i.test(source[i] || "")) i++;
        continue;
      }
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      state = "line";
      i += 2;
      continue;
    }
    if (ch === "/" && next === "*") {
      state = "block";
      i += 2;
      continue;
    }
    if (ch === "/" && isRegexLiteralStart(source, i)) {
      state = "regex";
      regexClass = false;
      i++;
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") {
      state = "quote";
      quote = ch;
      escaped = false;
      i++;
      continue;
    }

    i = visit(i);
  }
}

function identifierAt(source, i, word) {
  return source.startsWith(word, i) &&
    !/[\w$]/.test(source[i - 1] || "") &&
    !/[\w$]/.test(source[i + word.length] || "");
}

function parseQuoted(source, i) {
  const quote = source[i];
  if (quote !== "\"" && quote !== "'") return null;
  let value = "";
  let escaped = false;
  for (let j = i + 1; j < source.length; j++) {
    const ch = source[j];
    if (escaped) {
      value += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === quote) return { value, end: j + 1 };
    value += ch;
  }
  return null;
}

function isRegexLiteralStart(source, i) {
  let j = i - 1;
  while (/\s/.test(source[j] || "")) j--;
  if (j < 0) return true;
  return /[=(:,!&|?;{}\[]/.test(source[j] || "");
}

module.exports = { walkSurface, identifierAt, parseQuoted, isRegexLiteralStart };
