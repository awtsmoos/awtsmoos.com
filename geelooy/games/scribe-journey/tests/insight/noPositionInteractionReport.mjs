// B"H
// tests/insight/noPositionInteractionReport.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['js/workers', 'js/data/map_parser.js', 'js/data/map-parser', 'js/rendering'];
const allowedDynamicCoordinateFiles = [
  'js/workers/world/movement.js',
  'js/workers/world/entity/occupancy.js',
  'js/workers/world/interaction.js',
  'js/workers/botSystem.js',
  'js/workers/systems/triggers.js',
  'js/workers/combat/core.js',
  'js/data/map_parser.js'
];

const forbiddenStaticPatterns = [
  /currentMapId\s*={2,3}\s*['"][^'"]+['"][^\n]*(player\.(x|y)|p\.(x|y)|targetX|targetY)/,
  /(player\.(x|y)|p\.(x|y))\s*={2,3}\s*\d+[^\n]*(startDialogue|startBattle|giveItem|finalizeQuest|acceptQuest|targetMap|setFlag)/,
  /if\s*\([^\n]*(currentMapId|player\.(x|y)|p\.(x|y))[^\n]*\)[^\n]*(giveItem|startBattle|startDialogue|finalizeQuest|acceptQuest|setFlag)/
];

function walk(p, out = []) {
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const name of fs.readdirSync(p)) walk(path.join(p, name), out);
  else if (/\.(js|mjs)$/.test(p)) out.push(p);
  return out;
}

const files = ROOTS.flatMap(root => fs.existsSync(root) ? walk(root) : []);
const forbidden = [];
for (const file of files) {
  const rel = file.replace(/\\/g, '/');
  const txt = fs.readFileSync(file, 'utf8');
  txt.split(/\n/).forEach((line, index) => {
    if (forbiddenStaticPatterns.some(rx => rx.test(line))) {
      forbidden.push({ file: rel, line: index + 1, text: line.trim().slice(0, 180) });
    }
  });
}

const occupancy = fs.readFileSync('js/workers/world/entity/occupancy.js', 'utf8');
const interaction = fs.readFileSync('js/workers/world/interaction.js', 'utf8');
const parser = fs.readFileSync('js/data/map_parser.js', 'utf8');
const report = {
  scannedFiles: files.length,
  forbiddenStaticPositionInteractionCount: forbidden.length,
  forbiddenStaticPositionInteractions: forbidden,
  entityLookupUsesUnicodeTile: /const tile = map\?\.baseLayer\?\.\[y\]\?\.\[x\]/.test(occupancy) && /entityByGlyph\?\.\[tile\]/.test(occupancy),
  interactionUsesGetEntityAt: /getEntityAt\(map, tx, ty\)/.test(interaction),
  parserRewritesPlacedTilesToUu: /grid\[placement\.y\]\[placement\.x\] = fallbackUu/.test(parser),
  allowedDynamicCoordinateFiles
};
console.log(JSON.stringify(report, null, 2));
if (forbidden.length || !report.entityLookupUsesUnicodeTile || !report.interactionUsesGetEntityAt || !report.parserRewritesPlacedTilesToUu) process.exit(1);
