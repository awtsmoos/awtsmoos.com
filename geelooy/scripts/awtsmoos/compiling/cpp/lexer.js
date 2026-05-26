// B"H

const KEYWORDS = new Set([
  "class", "struct", "public", "private", "protected", "int", "char", "void",
  "return", "if", "else", "while", "for", "namespace", "using", "new", "delete"
]);

const TWO = new Set(["::", "->", "==", "!=", ">=", "<=", "++", "--", "+=", "-=", "&&", "||"]);

/**
 * B"H
 * Tokenizes a focused C++ subset into a clean stream.
 *
 * Chapter 1: sparks of syntax walk out of the source mist. Each token becomes
 * a tiny vessel, exact enough for parser judgment and small enough for future
 * native bytecode journeys.
 *
 * @param {string} source C++ source text.
 * @returns {Array<object>} Tokens with type, value, line, and column.
 */
export function tokenizeCpp(source = "") {
  const tokens = [];
  let i = 0, line = 1, col = 1;
  const push = (type, value, start = col) => tokens.push({ type, value, line, col: start });
  const step = () => source[i++] === "\n" ? (line++, col = 1) : col++;

  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) { step(); continue; }
    if (ch === "/" && source[i + 1] === "/") { while (i < source.length && source[i] !== "\n") step(); continue; }
    if (ch === "/" && source[i + 1] === "*") {
      step(); step();
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) step();
      if (i < source.length) { step(); step(); }
      continue;
    }
    const start = col;
    if (ch === '"') {
      let value = ""; step();
      while (i < source.length && source[i] !== '"') {
        if (source[i] === "\\") { step(); value += "\\" + (source[i] || ""); step(); }
        else { value += source[i]; step(); }
      }
      if (source[i] === '"') step();
      push("string", value, start); continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let value = "";
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) { value += source[i]; step(); }
      push(KEYWORDS.has(value) ? "keyword" : "id", value, start); continue;
    }
    if (/[0-9]/.test(ch)) {
      let value = "";
      while (i < source.length && /[0-9A-Fa-fx]/.test(source[i])) { value += source[i]; step(); }
      push("number", value, start); continue;
    }
    const two = source.slice(i, i + 2);
    if (TWO.has(two)) { step(); step(); push("op", two, start); continue; }
    if ("{}()[];,.:<>+-*/=!&|".includes(ch)) { step(); push("punct", ch, start); continue; }
    throw new Error(`Unexpected C++ character ${JSON.stringify(ch)} at ${line}:${col}`);
  }
  tokens.push({ type: "eof", value: "", line, col });
  return tokens;
}
