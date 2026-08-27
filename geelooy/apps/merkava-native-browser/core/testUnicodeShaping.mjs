// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('אבגדה emoji ✨ clusters', {'font-size':'18px'}, 160);
if (shaped.clusters < 10) throw new Error('clusters too low');
if (!t.log.text().includes('[text] shaped')) throw new Error('shape log missing');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, clusters:shaped.clusters, lines:shaped.lines.length, atlas:t.atlas.size}, null, 2));
