// B"H
import fs from 'fs';
import { simulateRuntime } from '../../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';
import { buildRuntimeFiles } from './modules/runtimeFiles.mjs';
import { countColors, dataUrlToBuffer, decodePng, saveReports, sha256 } from './modules/reporting.mjs';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout-v2';
fs.mkdirSync(outDir, { recursive: true });

/**
 * Chapter 1: the renderer walks into a storm-vault. The Awtsmoos gives every
 * canvas another instant of existence, and the harness asks: can you remember
 * overflow, transforms, SVG, ImageData, WebGL state, and still fit the world?
 */
async function main() {
  const result = await simulateRuntime({
    runtime: 'MekravaExecutor', entry: 'index.html', files: buildRuntimeFiles(),
    snapshot: true, format: 'png', fullPage: true,
    values: ['window.megaV2'], waitMs: 420
  });
  const snapshot = result.snapshot || {};
  const png = dataUrlToBuffer(snapshot.dataUrl || '');
  if (!png.length) throw new Error('mega layout v2 did not return PNG');
  const imagePath = `${outDir}/mega-layout-v2.png`;
  fs.writeFileSync(imagePath, png);
  const decoded = decodePng(png);
  const stats = countColors(decoded);
  const commandOps = (snapshot.canvas?.commands || []).map(c => c.op);
  const textures = (snapshot.canvas?.textures || []).map(textureSummary);
  const checks = buildChecks({ result, snapshot, decoded, stats, commandOps });
  const report = {
    generatedAt: new Date().toISOString(),
    pass: Object.values(checks).every(Boolean),
    image: { path: imagePath, bytes: png.length, sha256: sha256(png), width: decoded.width, height: decoded.height },
    checks, values: result.values, colorStats: stats, textures, commandOps
  };
  saveReports(`${outDir}/mega-report-v2`, report);
  console.log(JSON.stringify({ pass: report.pass, image: report.image, checks }, null, 2));
  process.exit(report.pass ? 0 : 1);
}

function buildChecks({ result, snapshot, decoded, stats, commandOps }) {
  return {
    runtimeOk: result.ok === true,
    workerReply: result.values?.['window.megaV2']?.worker === true,
    fitsViewport: decoded.width === 960 && decoded.height === 640,
    domCanvas: hasTexture(snapshot, 285, 132, 'canvas-2d'),
    offscreenNested: hasTexture(snapshot, 220, 94, 'canvas-2d'),
    workerTexture: hasTexture(snapshot, 240, 96, 'canvas-2d'),
    patternImageDataCanvas: hasTexture(snapshot, 285, 132, 'canvas-2d') && commandOps.includes('putImageData'),
    webglTexture: hasTexture(snapshot, 288, 172, 'canvas-webgl'),
    webglStateOps: ['webgl.createTexture', 'webgl.activeTexture', 'webgl.texImage2D', 'webgl.createProgram', 'webgl.drawArrays'].every(op => commandOps.includes(op)),
    transformOps: commandOps.includes('rotate'),
    drawImageDensity: commandOps.filter(op => op === 'drawImageTexture').length >= 3,
    pathAndTextOps: commandOps.includes('fillText') && commandOps.includes('strokePath'),
    rainbowAndWitnessColors: stats.red > 1000 && stats.yellow > 1800 && stats.lime > 1400 && stats.cyan > 3500 && stats.magenta > 1000,
    darkUiReadable: stats.white > 4500 && stats.dark > 120000,
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
