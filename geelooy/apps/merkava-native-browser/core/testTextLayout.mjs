// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('A long text line that must wrap in the executor text engine', {'font-family':'Segoe UI','font-size':'16px'}, 140);
if (shaped.lines.length < 2) throw new Error('expected line wrapping');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, lines:shaped.lines.length, clusters:shaped.clusters}, null, 2));
