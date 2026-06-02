// B"H
import fs from 'fs';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';
import { buildRuntimeFiles } from './mega-layout/modules/runtimeFiles.mjs';
import { countColors, dataUrlToBuffer, decodePng, saveReports, sha256 } from './mega-layout/modules/reporting.mjs';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout';
fs.mkdirSync(outDir, { recursive: true });

/**
 * Chapter 22: The split citadel is judged. The Awtsmoos demands not only one
 * green check but a census of layout, overflow, WebGL, and color witnesses.
 */
async function main() {
  const result = await simulateRuntime({
    runtime: 'MekravaExecutor', entry: 'index.html', files: buildRuntimeFiles(),
    snapshot: true, format: 'png', fullPage: true,
    values: ['window.megaState'], waitMs: 350
  });
  const snapshot = result.snapshot || {};
  const png = dataUrlToBuffer(snapshot.dataUrl || '');
  if (!png.length) throw new Error('mega layout did not return PNG');
  const imagePath = `${outDir}/mega-layout.png`;
  fs.writeFileSync(imagePath, png);
  const decoded = decodePng(png);
  const stats = countColors(decoded);
  const commandOps = (snapshot.canvas?.commands || []).map(c => c.op);
  const textures = (snapshot.canvas?.textures || []).map(textureSummary);
  const checks = buildChecks({ result, snapshot, decoded, stats, commandOps });
  const report = {
    generatedAt: new Date().toISOString(), pass: Object.values(checks).every(Boolean),
    image: { path: imagePath, bytes: png.length, sha256: sha256(png), width: decoded.width, height: decoded.height },
    checks, values: result.values, colorStats: stats, textures, commandOps
  };
  saveReports(`${outDir}/mega-report`, report);
  console.log(JSON.stringify({ pass: report.pass, image: report.image, checks }, null, 2));
  process.exit(report.pass ? 0 : 1);
}

function buildChecks({ result, snapshot, decoded, stats, commandOps }) {
  const css = String(snapshot.cssText || snapshot.html || '');
  const compact = css.replace(/\s+/g, '');
  return {
    runtimeOk: result.ok === true,
    workerReply: result.values?.['window.megaState']?.worker === true,
    fitsViewport: decoded.width === 960 && decoded.height === 640,
    manyCanvases: (snapshot.canvas?.textures || []).filter(t => t.kind === 'canvas-2d').length >= 16,
    offscreenNested: hasTexture(snapshot, 108, 54, 'canvas-2d'),
    workerTexture: hasTexture(snapshot, 108, 54, 'canvas-2d'),
    webglTexture: hasTexture(snapshot, 280, 166, 'canvas-webgl'),
    webglStateOps: ['webgl.createTexture', 'webgl.activeTexture', 'webgl.texImage2D', 'webgl.createProgram', 'webgl.drawArrays'].every(op => commandOps.includes(op)),
    imageDataOps: commandOps.includes('putImageData'),
    transformWitness: /transform\s*:/i.test(css) || ['rotate', 'scale', 'translate', 'transform', 'setTransform'].some(op => commandOps.includes(op)),
    overflowFamilies: ['overflow:hidden', 'overflow:scroll', 'overflow-x:scroll', 'overflow:auto', 'scrollbar-color'].every(bit => compact.includes(bit.replace(/\s+/g, ''))),
    zStackWitness: /z1\{|z2\{|z3\{|stackWitness/i.test(css + snapshot.html),
    drawImageDensity: commandOps.filter(op => op === 'drawImageTexture').length >= 2,
    pathAndTextOps: commandOps.includes('fillText') && commandOps.includes('strokePath') && commandOps.includes('fillPath'),
    rainbowAndWitnessColors: stats.red > 500 && stats.yellow > 2500 && stats.lime > 700 && stats.cyan > 9000 && stats.magenta > 500,
    darkUiReadable: stats.white > 900 && stats.dark > 80000,
    noPlaceholderOps: !commandOps.some(op => String(op).toLowerCase().includes('placeholder'))
  };
}

function hasTexture(snapshot, w, h, kind) {
  return (snapshot.canvas?.textures || []).some(t => t.kind === kind && Math.abs(t.width - w) <= 2 && Math.abs(t.height - h) <= 2);
}

function textureSummary(t) {
  return { id: t.id, kind: t.kind, width: t.width, height: t.height, ops: (t.commands || []).map(c => c.op) };
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
