// B"H
/**
 * Canvas conformance harness, first strict wave.
 * It records executable evidence for remaining Canvas2D/Offscreen/Worker/WebGL gaps.
 */
import fs from 'fs';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/canvas-conformance';
fs.mkdirSync(outDir, { recursive: true });

const tests = [stateCase(), pathCase(), imageCase(), workerCase(), webglCase()];
const results = [];
for (const test of tests) results.push(await runCase(test));
const assertions = results.flatMap(result => result.assertions);
const summary = {
  generatedAt: new Date().toISOString(),
  cases: results.length,
  total: assertions.length,
  passed: assertions.filter(a => a.pass).length,
  failed: assertions.filter(a => !a.pass).length,
  failedCases: results.filter(r => !r.pass).map(r => r.name),
  results
};
fs.writeFileSync(`${outDir}/conformance-report.json`, JSON.stringify(summary, null, 2));
fs.writeFileSync(`${outDir}/conformance-report.md`, markdown(summary));
console.log(JSON.stringify({ total: summary.total, passed: summary.passed, failed: summary.failed, failedCases: summary.failedCases }, null, 2));
process.exit(summary.failed ? 1 : 0);

async function runCase(test) {
  const result = await simulateRuntime({ runtime: 'MekravaExecutor', entry: 'index.html', files: { 'index.html': test.html, ...(test.files || {}) }, snapshot: true, format: 'json', values: ['window.result'], waitMs: 180 });
  const assertions = test.checks.map(([name, fn]) => check(name, fn, result));
  return {
    name: test.name,
    ok: result.ok,
    pass: assertions.every(a => a.pass),
    assertions,
    values: result.values,
    textureSummary: textures(result).map(t => ({ id: t.id, kind: t.kind, width: t.width, height: t.height, commands: (t.commands || []).map(c => c.op) })),
    commandOps: ops(result),
    errors: result.errors || []
  };
}

function check(name, fn, result) { try { return { name, pass: Boolean(fn(result)) }; } catch (error) { return { name, pass: false, error: error.message }; } }
function commands(result) { return result.snapshot?.canvas?.commands || []; }
function textures(result) { return result.snapshot?.canvas?.textures || []; }
function ops(result) { return commands(result).map(command => command.op); }
function hasOps(result, list) { const got = ops(result); return list.every(op => got.includes(op)); }
function hasTexture(result, fn) { return textures(result).some(fn); }

function stateCase() { return { name: 'canvas2d-state-and-transform', html: `<!doctype html><canvas id="c" width="220" height="160"></canvas><script>const x=document.getElementById('c').getContext('2d');window.result={};x.save();x.globalAlpha=.4;x.globalCompositeOperation='multiply';x.filter='blur(2px)';x.shadowBlur=5;x.shadowColor='rgba(1,2,3,.5)';x.translate(10,20);x.rotate(.5);x.scale(2,3);x.fillStyle='red';x.fillRect(1,2,30,40);const t=x.getTransform();x.restore();x.fillStyle='blue';x.fillRect(50,60,20,20);window.result={transform:t.toJSON(),restoredAlpha:x.globalAlpha,commands:document.textureArena.snapshot().commands.length};</script>`, checks: [['runtime ok', r => r.ok], ['restored alpha', r => r.values?.['window.result']?.restoredAlpha === 1], ['transform changed', r => Math.abs((r.values?.['window.result']?.transform?.a || 0) - 1) > .01], ['save/restore recorded', r => hasOps(r, ['save', 'restore'])], ['transform recorded', r => hasOps(r, ['translate', 'rotate', 'scale'])]] }; }
function pathCase() { return { name: 'path2d-curves-clip-and-fill-rules', html: `<!doctype html><canvas id="c" width="260" height="180"></canvas><script>const x=document.getElementById('c').getContext('2d');const p=new Path2D();p.moveTo(10,10);p.lineTo(80,20);p.quadraticCurveTo(130,10,120,80);p.bezierCurveTo(90,140,20,130,10,10);p.closePath();x.clip(p,'evenodd');x.fillStyle='green';x.fill(p,'evenodd');x.strokeStyle='cyan';x.lineWidth=4;x.stroke(p);window.result={commands:document.textureArena.snapshot().commands.length};</script>`, checks: [['runtime ok', r => r.ok], ['clip recorded', r => ops(r).includes('clip')], ['fill path recorded', r => ops(r).includes('fillPath')], ['stroke path recorded', r => ops(r).includes('strokePath')], ['curves preserved', r => JSON.stringify(commands(r)).includes('quadraticCurveTo') && JSON.stringify(commands(r)).includes('bezierCurveTo')]] }; }
function imageCase() { return { name: 'image-data-and-draw-image', html: `<!doctype html><canvas id="c" width="260" height="180"></canvas><script>const x=document.getElementById('c').getContext('2d');const off=new OffscreenCanvas(80,60);const o=off.getContext('2d');o.fillStyle='orange';o.fillRect(0,0,80,60);const d=o.getImageData(0,0,4,4);o.putImageData(d,5,5);x.drawImage(off.transferToImageBitmap(),20,30,120,90);window.result={commands:document.textureArena.snapshot().commands.length};</script>`, checks: [['runtime ok', r => r.ok], ['offscreen texture exists', r => hasTexture(r, t => t.width === 80 && t.height === 60)], ['image data recorded', r => hasOps(r, ['getImageData', 'putImageData'])], ['draw image recorded', r => ops(r).includes('drawImageTexture')]] }; }
function workerCase() { return { name: 'worker-offscreen-roundtrip', files: { 'worker.js': `onmessage=e=>{const o=new OffscreenCanvas(40,30);const x=o.getContext('2d');x.fillStyle='lime';x.fillRect(0,0,40,30);postMessage({ok:true,bitmap:o.transferToImageBitmap(),value:e.data.value+1});};` }, html: `<!doctype html><canvas id="c" width="260" height="180"></canvas><script>window.result={};const x=document.getElementById('c').getContext('2d');const w=new Worker('worker.js');w.onmessage=e=>{x.drawImage(e.data.bitmap,10,10,80,60);window.result=e.data;window.result.commands=document.textureArena.snapshot().commands.length};w.postMessage({value:41});</script>`, checks: [['runtime ok', r => r.ok], ['worker replied', r => r.values?.['window.result']?.ok === true && r.values?.['window.result']?.value === 42], ['worker canvas texture exists', r => hasTexture(r, t => t.width === 40 && t.height === 30)], ['worker drawImage recorded', r => ops(r).includes('drawImageTexture')]] }; }
function webglCase() { return { name: 'webgl-command-capture-baseline', html: `<!doctype html><canvas id="g" width="200" height="160"></canvas><script>const gl=document.getElementById('g').getContext('webgl');gl.clearColor(.2,.3,.7,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);window.result={commands:document.textureArena.snapshot().commands.length};</script>`, checks: [['runtime ok', r => r.ok], ['webgl texture exists', r => hasTexture(r, t => t.kind === 'canvas-webgl')], ['webgl clear recorded', r => hasOps(r, ['webgl.clearColor', 'webgl.clear'])], ['webgl draw recorded', r => ops(r).includes('webgl.drawArrays')]] }; }
function markdown(summary) { return `# B"H Canvas Conformance First Wave\n\nTotal: ${summary.total}\nPassed: ${summary.passed}\nFailed: ${summary.failed}\n\n## Failed cases\n${summary.failedCases.map(x => `- ${x}`).join('\n') || '- none'}\n\n${summary.results.map(r => `## ${r.name}\nPass: ${r.pass}\n${r.assertions.map(a => `- ${a.pass ? 'PASS' : 'FAIL'} ${a.name}${a.error ? ` — ${a.error}` : ''}`).join('\n')}\nCommands: ${r.commandOps.join(', ')}\n`).join('\n')}`; }
