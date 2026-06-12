// B"H
const cp = require("child_process");
const path = require("path");

const JS_EXT = new Set([".js", ".cjs", ".mjs"]);
const KNOWN = new Set("globalThis global window self document console Promise Array Object String Number Boolean Symbol BigInt Math JSON Date RegExp Error TypeError SyntaxError Set Map WeakMap WeakSet Proxy Reflect Intl URL URLSearchParams Buffer process require module exports __dirname __filename setTimeout clearTimeout setInterval clearInterval requestAnimationFrame fetch event".split(" "));

function shouldVerify(filePath) { return JS_EXT.has(path.extname(filePath).toLowerCase()); }

function verifyJsFile(filePath, options = {}) {
  if (!shouldVerify(filePath) || options.checkSyntax === false) return null;
  const syntax = checkSyntax(filePath);
  const staticHints = syntax.ok ? obviousStaticHints(filePath) : [];
  return { ok: syntax.ok, syntax, staticHints };
}

async function verifyJsRuntime(filePath, options = {}) {
  if (!shouldVerify(filePath) || options.runtimeCheck !== true) return null;
  try {
    const fs = require("fs");
    const { RuntimeAssembler } = require("../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js");
    const entry = path.basename(filePath);
    const files = { [entry]: fs.readFileSync(filePath, "utf8") };
    const runtime = options.runtime || "browser";
    const got = await new RuntimeAssembler({ runtime, files, entry }).run(entry);
    return { ok: got.ok !== false, engine: "merkava", runtime, errors: got.result?.error ? [got.result.error] : got.errors || [] };
  } catch (error) {
    return { ok: false, engine: "merkava", error: error.message, stack: error.stack || "" };
  }
}

function checkSyntax(filePath) {
  const got = cp.spawnSync(process.execPath, ["--check", filePath], { encoding: "utf8", timeout: 15000 });
  return { ok: got.status === 0, exitCode: got.status, stdout: got.stdout || "", stderr: got.stderr || "" };
}

function obviousStaticHints(filePath) {
  const fs = require("fs"), text = strip(fs.readFileSync(filePath, "utf8"));
  const declared = new Set([...KNOWN]), used = new Map(); collectDeclarations(text, declared);
  for (const match of text.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
    const id = match[1], prev = text.slice(Math.max(0, match.index - 2), match.index);
    if (prev.endsWith(".") || RESERVED.has(id)) continue;
    if (!used.has(id)) used.set(id, match.index);
  }
  const hints = [];
  for (const [id, index] of used) if (!declared.has(id)) hints.push({ kind: "possible_undefined_identifier", id, index });
  return hints.slice(0, 50);
}

function collectDeclarations(text, declared) {
  const patterns = [/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,/\bimport\s+([A-Za-z_$][\w$]*)\b/g,/\bas\s+([A-Za-z_$][\w$]*)/g,/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g];
  for (const p of patterns) for (const m of text.matchAll(p)) declared.add(m[1]);
  for (const fn of text.matchAll(/\(([^)]*)\)\s*=>|function\s*[^(]*\(([^)]*)\)/g)) String(fn[1] || fn[2] || "").split(",").map(s => s.trim()).filter(Boolean).forEach(x => /^[A-Za-z_$][\w$]*$/.test(x) && declared.add(x));
}

function strip(s) { return String(s).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ").replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, " "); }

const RESERVED = new Set("break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield await async of from as true false null undefined static get set constructor".split(" "));

module.exports = { verifyJsFile, verifyJsRuntime, shouldVerify };
