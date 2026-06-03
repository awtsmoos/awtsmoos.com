// B"H
import fs from 'fs';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';
import { buildLabyrinthFiles } from './layout-labyrinth/modules/labyrinthFiles.mjs';
import { countColors, dataUrlToBuffer, decodePng, saveReports, sha256 } from './mega-layout/modules/reporting.mjs';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/layout-labyrinth';
fs.mkdirSync(outDir, { recursive: true });

/**
 * Chapter 29: the certification gauntlet adds wrap, minmax, alignment, z-index,
 * absolute layout, ImageBitmap, and UI corpus gates. The Awtsmoos judges source
 * intent, command streams, and the living PNG together.
 */
async function main() {
  const files = buildLabyrinthFiles();
  const sourceText = Object.values(files).join('\n');
  const result = await simulateRuntime({
    runtime: 'MekravaExecutor', entry: 'index.html', files,
    snapshot: true, format: 'png', fullPage: true, waitMs: 300,
    values: ['window.labState']
  });
  const snapshot = result.snapshot || {};
  const png = dataUrlToBuffer(snapshot.dataUrl || '');
  if (!png.length) throw new Error('layout labyrinth did not return PNG');
  const imagePath = `${outDir}/layout-labyrinth.png`;
  fs.writeFileSync(imagePath, png);
  const decoded = decodePng(png);
  const stats = countColors(decoded);
  const ops = (snapshot.canvas?.commands || []).map(c => c.op);
  const textures = snapshot.canvas?.textures || [];
  const checks = checksFor({ result, decoded, stats, ops, textures, sourceText });
  const report = {
    generatedAt: new Date().toISOString(), pass: Object.values(checks).every(Boolean),
    image: { path: imagePath, bytes: png.length, sha256: sha256(png), width: decoded.width, height: decoded.height },
    checks, values: result.values, colorStats: stats,
    textures: textures.map(t => ({ id: t.id, kind: t.kind, width: t.width, height: t.height, ops: (t.commands || []).map(c => c.op) })),
    commandOps: ops
  };
  saveReports(`${outDir}/layout-labyrinth-report`, report);
  console.log(JSON.stringify({ pass: report.pass, image: report.image, checks }, null, 2));
  process.exit(report.pass ? 0 : 1);
}

function checksFor({ result, decoded, stats, ops, textures, sourceText }) {
  return {
    runtimeOk: result.ok === true,
    labReady: result.values?.['window.labState']?.ready === true,
    fitsViewport: decoded.width === 960 && decoded.height === 640,
    deepLayoutText: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'GRID', 'FLEX'].every(t => sourceText.includes(t)),
    wrapAndMinmax: ['flex-wrap:wrap', 'minmax(', 'fit-content(', 'grid-template-columns'].every(t => sourceText.includes(t)),
    alignmentAndZ: ['alignGrid', 'z-index:1', 'z-index:2', 'z-index:3', 'position:absolute'].every(t => sourceText.includes(t)),
    overflowAndScroll: ['overflow:hidden', 'overflow:scroll', 'overflow-x:scroll', 'overflow:auto', 'scrollbar-color'].every(t => sourceText.includes(t)),
    transforms: ['rotate', 'scale', 'translate'].every(t => sourceText.includes(t)),
    svgWitness: sourceText.includes('<svg') && sourceText.includes('<circle') && sourceText.includes('<path') && sourceText.includes('<clipPath'),
    imageBitmapChain: ['OffscreenCanvas', 'transferToImageBitmap', 'drawImage'].every(t => sourceText.includes(t)),
    realUiCorpus: ['IDE', 'MAIL', 'KAN'].every(t => sourceText.includes(t)),
    canvasDensity: textures.filter(t => t.kind === 'canvas-2d').length >= 20,
    webglTexture: textures.some(t => t.kind === 'canvas-webgl' && Math.abs(t.width - 260) <= 2 && Math.abs(t.height - 118) <= 2),
    webglOps: ['webgl.createTexture', 'webgl.createProgram', 'webgl.drawArrays'].every(op => ops.includes(op)),
    pathTextAndGridOps: ops.includes('fillText') && ops.includes('strokeRect') && ops.includes('fillRect'),
    colorRich: stats.red > 700 && stats.yellow > 2500 && stats.cyan > 2500 && stats.magenta > 600 && stats.lime > 500,
    darkReadable: stats.dark > 80000 && stats.white > 1200
  };
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
