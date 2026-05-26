// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('hello שלום', {'font-family':'Segoe UI'}, 300);
if (!t.log.text().includes('fallback')) throw new Error('fallback log missing');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, font:shaped.font, atlas:t.atlas.size}, null, 2));
