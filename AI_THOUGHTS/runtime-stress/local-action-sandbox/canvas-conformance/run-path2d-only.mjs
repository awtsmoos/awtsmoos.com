// B"H
/** Path2D focused conformance runner. */
import fs from 'fs';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/canvas-conformance';
const html = `<!doctype html><canvas id="c" width="260" height="180"></canvas><script>
const x=document.getElementById('c').getContext('2d');
const p=new Path2D();
p.moveTo(10,10); p.lineTo(80,20); p.quadraticCurveTo(130,10,120,80); p.bezierCurveTo(90,140,20,130,10,10); p.closePath();
x.clip(p,'evenodd');
x.fillStyle='green'; x.fill(p,'evenodd');
x.strokeStyle='cyan'; x.lineWidth=4; x.stroke(p);
window.result={pathCommands:p.commands, snapshot:document.textureArena.snapshot()};
</script>`;
const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files:{'index.html':html}, snapshot:true, format:'json', values:['window.result'], waitMs:50 });
const text = JSON.stringify(result.snapshot?.canvas?.commands || []);
const report = {
  generatedAt: new Date().toISOString(),
  ok: result.ok,
  commandOps: (result.snapshot?.canvas?.commands || []).map(command => command.op),
  hasQuadratic: text.includes('quadraticCurveTo'),
  hasBezier: text.includes('bezierCurveTo'),
  pathCommands: result.values?.['window.result']?.pathCommands || null,
  pass: result.ok && text.includes('quadraticCurveTo') && text.includes('bezierCurveTo')
};
fs.writeFileSync(`${outDir}/path2d-only-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
