// B"H
/**
 * Discovers every HTML entry under geelooy/apps and geelooy/games.
 */
const fs = require('fs');
const path = require('path');

const roots = ['geelooy/apps', 'geelooy/games'];
const ignored = new Set(['node_modules', '.git', 'AI_THOUGHTS']);
const rows = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.html?$/i.test(ent.name)) rows.push(full.replace(/\\/g, '/'));
  }
}

for (const root of roots) walk(root);
rows.sort();
fs.writeFileSync('AI_THOUGHTS/runtime-stress/all-app-game-html.json', JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, rows }, null, 2));
console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
