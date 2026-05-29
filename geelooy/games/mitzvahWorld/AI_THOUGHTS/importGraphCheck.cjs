// B"H
/**
 * @file importGraphCheck.cjs
 * @description Chapter 89: CommonJS import graph candle for the ES-module app.
 * The Awtsmoos follows every static relative import under OlamVessel until the
 * missing child module stops hiding behind the parent dynamic-import error.
 */
const fs = require("fs");
const path = require("path");
const start = "ckidsAwtsmoos/Olam/core/OlamVessel.js";
const seen = new Set();
const missing = [];
const queryImports = [];
const staticImportPattern = /import(?:\s+[\s\S]*?from\s*)?["']([^"']+)["']/g;

function normalize(fromFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  if (specifier.includes("?")) queryImports.push({ fromFile, specifier });
  const clean = specifier.split("?")[0];
  return path.normalize(path.join(path.dirname(fromFile), clean)).replace(/\\/g, "/");
}

function scan(file) {
  if (seen.has(file)) return;
  seen.add(file);
  if (!fs.existsSync(file)) {
    missing.push(file);
    return;
  }
  const source = fs.readFileSync(file, "utf8");
  let match;
  while ((match = staticImportPattern.exec(source))) {
    const child = normalize(file, match[1]);
    if (child) scan(child);
  }
}

scan(start);
console.log(JSON.stringify({ start, seenCount: seen.size, missing, queryImports }, null, 2));
process.exit(missing.length || queryImports.length ? 2 : 0);
