// B"H
const fs = require("fs");
const path = require("path");
const entry = path.join("geelooy", "heichelos", "post", "styles", "comments", "inline-intense.css");
const importRe = /@import\s+url\(["']?([^"')]+)["']?\)\s*;/g;

function normalize(file) {
  return path.normalize(file);
}

function resolveImport(fromFile, href) {
  return normalize(path.join(path.dirname(fromFile), href));
}

function collectActive(file, seen = new Set()) {
  const normalized = normalize(file);
  if (seen.has(normalized)) return [];
  seen.add(normalized);
  const css = fs.readFileSync(normalized, "utf8");
  const files = [normalized];
  let match;
  while ((match = importRe.exec(css))) files.push(...collectActive(resolveImport(normalized, match[1]), seen));
  return files;
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function mediaContext(prefix) {
  const trimmed = prefix.trim().replace(/\s+/g, " ");
  const matches = [...trimmed.matchAll(/@media\s*([^{}]+)$/g)];
  return matches.length ? matches[matches.length - 1][1].trim() : "base";
}

function declarationEntries(file) {
  const css = stripComments(fs.readFileSync(file, "utf8"));
  const re = /([^{}]+)\{([^{}]+)\}/g;
  const entries = [];
  let match;
  while ((match = re.exec(css))) {
    const selector = match[1].trim().replace(/\s+/g, " ");
    if (selector.startsWith("@")) continue;
    const context = mediaContext(css.slice(0, match.index));
    for (const raw of match[2].split(";")) {
      const index = raw.indexOf(":");
      if (index < 0) continue;
      const property = raw.slice(0, index).trim();
      const value = raw.slice(index + 1).trim();
      if (!property || property.startsWith("@")) continue;
      entries.push({ file, context, selector, property, value });
    }
  }
  return entries;
}

const map = new Map();
for (const file of collectActive(entry)) {
  for (const entry of declarationEntries(file)) {
    const key = `${entry.context} :: ${entry.selector} :: ${entry.property}`;
    const list = map.get(key) || [];
    list.push(entry);
    map.set(key, list);
  }
}

const conflicts = [];
for (const [key, list] of map) {
  const values = [...new Set(list.map(item => item.value))];
  if (values.length > 1) conflicts.push({ key, list });
}

conflicts.sort((a, b) => b.list.length - a.list.length || a.key.localeCompare(b.key));
for (const conflict of conflicts) {
  console.log(`\n${conflict.key}`);
  for (const item of conflict.list) console.log(`  ${item.file} => ${item.value}`);
}
console.log(`\nACTIVE_FILES=${collectActive(entry).length}`);
console.log(`TOTAL_ACTIVE_CONFLICT_KEYS=${conflicts.length}`);
