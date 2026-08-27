// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><main id=app><section class=card><h1>Real DOM</h1><p><strong>nested</strong> text</p></section></main></body>', true);
const frame = rt.frame({ width: 500, height: 300 });
const doc = rt.window.document;
const main = doc.querySelector('#app');
const section = doc.querySelector('.card');
const strong = doc.querySelector('strong');
if (!main || !section || !strong) throw new Error('hydrator did not create queryable DOM nodes');
const textOps = rt.layout.ops.filter(op => op.op === 'layoutText').map(op => op.text).join(' | ');
if (doc.body.textContent.includes('<section')) throw new Error('HTML source leaked into visible textContent');
if (!textOps.includes('Real DOM') || !textOps.includes('nested')) throw new Error('layout did not emit nested DOM text nodes: ' + textOps);
if (frame.snapshot.commands.some(op => JSON.stringify(op).includes('<section'))) throw new Error('renderer painted raw HTML markup instead of DOM boxes');
if (frame.summary.treeNodes < 7 || frame.summary.renderOps < 8) throw new Error('render summary too small for nested DOM stress case');
console.log(rt.report().log);
console.log(JSON.stringify({ ok: true, treeNodes: frame.summary.treeNodes, renderOps: frame.summary.renderOps, textOps }, null, 2));
