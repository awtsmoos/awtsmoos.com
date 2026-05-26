// B"H
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const files = {
  'testStreamingHtmlHydration.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
const chunks = ['<body><main id=feed>', ...Array.from({length:60}, (_,i)=>'<article class=card><h2>Post '+i+'</h2><p>streamed text '+i+'</p></article>'), '<script src="/late.js"></script></main></body>'];
for (let i=0;i<chunks.length;i++) rt.pushHtml(chunks[i], i===chunks.length-1);
const frame = rt.frame({width:760,height:900});
const report = rt.report();
if (report.dom.createdNodes < 180) throw new Error('expected large streaming DOM, got '+report.dom.createdNodes);
if (!report.log.includes('[hydrate] createdNodes')) throw new Error('missing hydrate log');
if (!report.log.includes('[script] ordered')) throw new Error('missing script ordering log');
console.log(report.log);
console.log(JSON.stringify({ok:true, createdNodes:report.dom.createdNodes, invalidations:report.dom.invalidations, renderOps:frame.summary.renderOps}, null, 2));
`,
  'testIncrementalDomMutation.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><main id=app><section id=list></section></main></body>', true);
rt.frame();
rt.appendHtml('#list', '<div id=added class=row>Async DOM insertion</div><p>live mutation</p>');
const frame = rt.frame();
const report = rt.report();
if (!rt.window.document.querySelector('#added')) throw new Error('async inserted node missing');
if (report.dom.mutations < 2) throw new Error('mutation queue not populated');
if (!report.log.includes('[dom] appendChild div#added.row -> section#list')) throw new Error('mutation log missing');
console.log(report.log);
console.log(JSON.stringify({ok:true, mutations:report.dom.mutations, invalidations:report.dom.invalidations, renderOps:frame.summary.renderOps}, null, 2));
`,
  'testFlexboxLayout.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><style>#row{display:flex;width:640px;gap:10px}.item{width:100px;height:30px;background-color:#aabbcc}</style><div id=row><div class=item>A</div><div class=item>B</div><div class=item>C</div><div class=item>D</div></div></body>', true);
const frame = rt.frame({width:760,height:400});
if (!rt.report().log.includes('[layout] flex row width=640 children=4')) throw new Error('flex layout log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, treeNodes:frame.summary.treeNodes, layoutOps:frame.summary.layoutOps}, null, 2));
`,
  'testInlineTextFlow.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><p style="width:120px;font-size:16px">This inline sentence should wrap across multiple executor-computed lines.</p></body>', true);
rt.shapeText('This inline sentence should wrap across multiple executor-computed lines.', {'font-size':'16px'}, 120);
const frame = rt.frame({width:220,height:400});
if (!rt.report().log.includes('[text] linebreak')) throw new Error('text linebreak log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, layoutOps:frame.summary.layoutOps, atlas:rt.report().textAtlasGlyphs}, null, 2));
`,
  'testOverflowClip.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><div id=clip style="width:200px;height:100px;overflow:hidden;background-color:#dddddd"><p style="height:260px">too tall</p></div></body>', true);
const frame = rt.frame({width:400,height:400});
if (!rt.report().log.includes('[layout] overflow clip')) throw new Error('overflow clip log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, clips:rt.layout.clips.length, renderOps:frame.summary.renderOps}, null, 2));
`,
  'testEventPropagation.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><main id=app><button id=draw style="width:120px;height:40px">draw</button></main></body>', true);
let hits=0; rt.window.document.querySelector('#app').addEventListener('mousedown',()=>hits++); rt.frame(); rt.pointer('pointerdown', 20, 20);
if (!hits) throw new Error('bubble listener not hit');
if (!rt.report().log.includes('[event] capture')) throw new Error('capture log missing');
if (!rt.report().log.includes('[event] bubble')) throw new Error('bubble log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, hits}, null, 2));
`,
  'testFocusRouting.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><input id=name value=abc style="width:160px;height:30px"></body>', true);
rt.frame(); rt.pointer('pointerdown', 20, 20); rt.keyboard('keydown','A');
if (rt.window.document.activeElement?.id !== 'name') throw new Error('focus did not route to input');
if (!rt.report().log.includes('[event] focus changed target=input#name')) throw new Error('focus log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, active:rt.window.document.activeElement.id}, null, 2));
`,
  'testPointerHitboxes.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><canvas id=stage width=200 height=80></canvas><button id=after style="width:120px;height:40px">after</button></body>', true);
rt.frame(); const hit = rt.pointer('pointermove', 30, 30);
if (!hit.target.includes('canvas#stage')) throw new Error('expected canvas hit, got '+hit.target);
if (!rt.report().log.includes('[event] hover enter')) throw new Error('hover log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, target:hit.target}, null, 2));
`,
  'testWebGLBytecodeCompiler.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
const out = rt.compileWebGLDemo();
for (const op of ['CREATE_SHADER','COMPILE_SHADER','LINK_PROGRAM','BUFFER_DATA','DRAW_ARRAYS']) if (!rt.report().log.includes('[webgl] '+op)) throw new Error('missing '+op);
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, ops:out.ops.length, bytes:out.bytes}, null, 2));
`,
  'testShaderPipeline.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { WebGLBytecodeCompiler } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/WebGLBytecodeCompiler.js');
const gl = new WebGLBytecodeCompiler(); const v=gl.createShader('vertex','void main(){}'); gl.compileShader(v); const f=gl.createShader('fragment','void main(){}'); gl.compileShader(f); const p=gl.createProgram(); gl.attachShader(p,v); gl.attachShader(p,f); gl.linkProgram(p); gl.useProgram(p);
if (!gl.state.program) throw new Error('program not active');
console.log(gl.log.text());
console.log(JSON.stringify({ok:true, program:gl.state.program, ops:gl.ops.length}, null, 2));
`,
  'testTextureUpload.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { WebGLBytecodeCompiler } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/WebGLBytecodeCompiler.js');
const gl = new WebGLBytecodeCompiler(); const t=gl.createTexture(); gl.texImage2D(t,64,64,64*64*4);
if (!gl.log.text().includes('[webgl] TEX_IMAGE_2D bytes=16384')) throw new Error('texture upload log missing');
console.log(gl.log.text());
console.log(JSON.stringify({ok:true, texture:t, bytes:gl.state.textures[t].bytes}, null, 2));
`,
  'testTextLayout.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('A long text line that must wrap in the executor text engine', {'font-family':'Segoe UI','font-size':'16px'}, 140);
if (shaped.lines.length < 2) throw new Error('expected line wrapping');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, lines:shaped.lines.length, clusters:shaped.clusters}, null, 2));
`,
  'testFontFallback.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('hello שלום', {'font-family':'Segoe UI'}, 300);
if (!t.log.text().includes('fallback')) throw new Error('fallback log missing');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, font:shaped.font, atlas:t.atlas.size}, null, 2));
`,
  'testUnicodeShaping.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { TextLayoutEngine } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/TextLayoutEngine.js');
const t = new TextLayoutEngine(); const shaped=t.shape('אבגדה emoji ✨ clusters', {'font-size':'18px'}, 160);
if (shaped.clusters < 10) throw new Error('clusters too low');
if (!t.log.text().includes('[text] shaped')) throw new Error('shape log missing');
console.log(t.log.text());
console.log(JSON.stringify({ok:true, clusters:shaped.clusters, lines:shaped.lines.length, atlas:t.atlas.size}, null, 2));
`,
  'testRealDomRenderStress.mjs': `// B"H
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
`,
  'testMouseCoordinateStress.mjs': `// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><button id=left style="width:80px;height:40px">Left</button><button id=right style="width:90px;height:40px">Right</button></body>', true);
const seen = [];
rt.window.document.querySelector('#left').addEventListener('mousemove', ev => seen.push(['left-move', ev.clientX, ev.clientY]));
rt.window.document.querySelector('#right').addEventListener('mousedown', ev => seen.push(['right-down', ev.clientX, ev.clientY]));
rt.window.document.querySelector('#right').addEventListener('click', ev => seen.push(['right-click', ev.clientX, ev.clientY]));
rt.frame({ width: 300, height: 120 });
const hover = rt.pointer('pointermove', 30, 20);
const down = rt.pointer('pointerdown', 30, 60);
const up = rt.pointer('pointerup', 30, 60);
if (!hover.target.includes('button#left')) throw new Error('hover hit wrong target: ' + hover.target);
if (!down.target.includes('button#right')) throw new Error('down hit wrong target: ' + down.target);
if (!up.target.includes('button#right')) throw new Error('up hit wrong target: ' + up.target);
if (!seen.some(row => row[0] === 'left-move' && row[1] === 30 && row[2] === 20)) throw new Error('mousemove did not carry real coordinates: ' + JSON.stringify(seen));
if (!seen.some(row => row[0] === 'right-down' && row[1] === 30 && row[2] === 60)) throw new Error('mousedown did not carry real coordinates: ' + JSON.stringify(seen));
if (!seen.some(row => row[0] === 'right-click' && row[1] === 30 && row[2] === 60)) throw new Error('click did not fire with real coordinates: ' + JSON.stringify(seen));
console.log(rt.report().log);
console.log(JSON.stringify({ ok: true, seen, hover: hover.target, down: down.target, up: up.target }, null, 2));
`
};
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);
console.log(JSON.stringify({ok:true, wrote:Object.keys(files).length, files:Object.keys(files)}, null, 2));
