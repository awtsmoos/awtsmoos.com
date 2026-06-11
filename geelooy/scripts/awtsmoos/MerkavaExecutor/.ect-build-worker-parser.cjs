// B"H
const fs = require("fs");
const parserDir = "../MerkavaASTParser";
const workerFiles = ["Lexer.js", "parser-expressions.js", "parser-statements.js", "parser-declarations.js"];
for (const file of workerFiles) {
  const srcPath = `${parserDir}/${file}`;
  const outPath = `${parserDir}/${file.replace(/\.js$/, ".worker.js")}`;
  const source = fs.readFileSync(srcPath, "utf8");
  const compacted = compact(source);
  fs.writeFileSync(outPath, compacted);
  console.log(`${file} ${Buffer.byteLength(source)} -> ${Buffer.byteLength(compacted)}`);
}
const core = fs.readFileSync(`${parserDir}/parser-core.js`, "utf8");
const mapped = core
  .replace("await loadScript('./Lexer.js');", "await loadScript(isWorker ? './Lexer.worker.js' : './Lexer.js');")
  .replace("const LexerClass = isNode ? require('./Lexer.js') : self.Lexer;", "const LexerClass = isNode ? require('./Lexer.js') : self.Lexer;")
  .replace("await loadScript('./parser-expressions.js');", "await loadScript(isWorker ? './parser-expressions.worker.js' : './parser-expressions.js');")
  .replace("await loadScript('./parser-statements.js');", "await loadScript(isWorker ? './parser-statements.worker.js' : './parser-statements.js');")
  .replace("await loadScript('./parser-declarations.js');", "await loadScript(isWorker ? './parser-declarations.worker.js' : './parser-declarations.js');");
fs.writeFileSync(`${parserDir}/parser-core.worker.js`, mapped);
console.log(`parser-core.worker.js ${Buffer.byteLength(mapped)}`);

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
