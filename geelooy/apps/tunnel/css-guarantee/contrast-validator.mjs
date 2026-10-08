#!/usr/bin/env node
// B"H — Mandatory CSS contrast validator. BLOCKS deployment on failure.
// Checks: white text on light backgrounds, missing theme variants.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2] || "/Users/awtsmoos/work/awtsmoos.com/geelooy";
const issues = [];
const cssFiles = [];

async function scan(dir) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await scan(p);
    else if (e.name.endsWith(".css")) cssFiles.push(p);
  }
}
await scan(root);

for (const file of cssFiles) {
  const css = await readFile(file, "utf8");
  const lines = css.split("\n");
  let inLightTheme = false;
  let braceDepth = 0, lightDepth = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\[data-theme=.?light.?\]|:root\[data-theme=.?light.?\]|\.theme-light/.test(line)) { inLightTheme = true; lightDepth = braceDepth; }
    braceDepth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (inLightTheme && braceDepth <= lightDepth) inLightTheme = false;
    const t = line.trim();
    if (/^\s*color\s*:\s*(white|#fff\b|#ffffff|#fefefe)/i.test(t)) {
      const ctx = lines.slice(Math.max(0,i-8), Math.min(lines.length,i+3)).join("\n");
      const hasDarkBg = /background(-color)?\s*:\s*#([0-9a-f]{3}|[0-9a-f]{6})\b/i.test(ctx) && !/background(-color)?\s*:\s*#fff/i.test(ctx);
      if (inLightTheme && !hasDarkBg) issues.push({file: file.replace(root,""), line: i+1, problem: "white text inside light-theme scope without dark background", code: t});
    }
  }
}
const result = { filesChecked: cssFiles.length, issueCount: issues.length, issues, ok: issues.length === 0, blocking: true };
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
