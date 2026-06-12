// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

const SYMBOLS = [
  /\bexport\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\bclass\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g
];

function comments(text) {
  return (text.match(/\/\*\*[\s\S]*?\*\/|\/\/[^\n]*/g) || []).slice(0, 40);
}

function symbols(text) {
  const out = [];
  for (const re of SYMBOLS) {
    let m;
    while ((m = re.exec(text))) out.push({ name: m[1], index: m.index });
  }
  return out.sort((a, b) => a.index - b.index).slice(0, 200);
}

async function symbolOutline(config, payload) {
  const full = safePath(config, payload.path || payload.p || ".");
  const text = await fs.readFile(full, "utf8");
  return {
    ok: true,
    action: "symbolOutline",
    path: path.relative(config.root, full).replace(/\\/g, "/"),
    symbols: symbols(text),
    comments: payload.includeComments === false ? [] : comments(text)
  };
}

module.exports = { symbolOutline, symbols, comments };
