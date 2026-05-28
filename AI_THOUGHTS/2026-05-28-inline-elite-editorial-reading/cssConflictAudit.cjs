// B"H
const fs = require("fs");
const path = require("path");
const root = path.join("geelooy", "heichelos", "post", "styles", "comments", "inline");

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(next);
    return entry.name.endsWith(".css") ? [next] : [];
  });
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function declarationEntries(file) {
  const css = stripComments(fs.readFileSync(file, "utf8"));
  const re = /([^{}]+)\{([^{}]+)\}/g;
  const entries = [];
  let match;
  while ((match = re.exec(css))) {
    const selector = match[1].trim().replace(/\s+/g, " ");
    const body = match[2];
    for (const raw of body.split(";")) {
      const index = raw.indexOf(":");
      if (index < 0) continue;
      const property = raw.slice(0, index).trim();
      const value = raw.slice(index + 1).trim();
      if (!property || property.startsWith("@")) continue;
      entries.push({ file, selector, property, value });
    }
  }
  return entries;
}

const map = new Map();
for (const file of collectFiles(root)) {
  for (const entry of declarationEntries(file)) {
    const key = `${entry.selector} :: ${entry.property}`;
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
console.log(`\nTOTAL_CONFLICT_KEYS=${conflicts.length}`);
