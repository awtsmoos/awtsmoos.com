// B"H
const fs = require("fs");
const source = fs.readFileSync("app/compiler/js-compiler.js", "utf8");
const out = compact(source);
fs.writeFileSync("app/compiler/js-compiler.worker.js", out);
console.log(JSON.stringify({ source: Buffer.byteLength(source), worker: Buffer.byteLength(out), file: "app/compiler/js-compiler.worker.js" }));

function compact(text) {
  let out = "";
  let quote = "";
  let templateDepth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1] || "";
    const prev = out[out.length - 1] || "";
    if (quote) {
      out += ch;
      if (ch === "\\") { i += 1; out += text[i] || ""; continue; }
      if (quote === "`" && ch === "$" && next === "{") { out += next; i += 1; templateDepth += 1; quote = ""; continue; }
      if (ch === quote) quote = "";
      continue;
    }
    if (templateDepth && ch === "}") { templateDepth -= 1; out += ch; if (!templateDepth) quote = "`"; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; out += ch; continue; }
    if (ch === "/" && next === "/") { while (i < text.length && text[i] !== "\n") i += 1; continue; }
    if (ch === "/" && next === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1; i += 1; continue; }
    if (/\s/.test(ch)) { if (needsSpace(prev, next)) out += " "; continue; }
    out += ch;
  }
  return out;
}
function needsSpace(a, b) { return /[A-Za-z0-9_$]/.test(a || "") && /[A-Za-z0-9_$]/.test(b || ""); }
