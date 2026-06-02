// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout-v2');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

/**
 * Chapter 2: the screenshot is lifted like a luminous tablet before MiniMax;
 * if the image lies, the audit must cut the fog and turn criticism into gates.
 */
async function main() {
  const imagePath = path.join(outDir, 'mega-layout-v2.png');
  const reportPath = path.join(outDir, 'mega-report-v2.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
  const prompt = buildPrompt(report);
  const payload = {
    model: 'MiniMax-M3', stream: false, temperature: 0.05, max_tokens: 1100,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }]
  };
  fs.writeFileSync(path.join(outDir, 'minimax-mega-v2-request.redacted.json'), JSON.stringify({ model: payload.model, promptBytes: prompt.length, imageBytes: fs.statSync(imagePath).size }, null, 2));
  const res = await fetch('https://api.minimax.io/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const text = await res.text();
  fs.writeFileSync(path.join(outDir, 'minimax-mega-v2-response.raw.txt'), text);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch {}
  const answer = parsed?.choices?.[0]?.message?.content || text;
  fs.writeFileSync(path.join(outDir, 'minimax-mega-v2-answer.md'), answer);
  fs.writeFileSync(path.join(outDir, 'minimax-mega-v2-summary.json'), JSON.stringify({ ok: res.ok, status: res.status, pass: /^\s*PASS/i.test(answer), answerLength: answer.length }, null, 2));
  console.log(JSON.stringify({ ok: res.ok, status: res.status, pass: /^\s*PASS/i.test(answer), answer: answer.slice(0, 1800) }, null, 2));
  if (!res.ok) process.exit(1);
}

function buildPrompt(report) {
  const compact = {
    pass: report.pass,
    image: report.image,
    checks: report.checks,
    textureCount: report.textures?.length || 0,
    webglOps: (report.textures || []).find(t => t.kind === 'canvas-webgl')?.ops || [],
    colorStats: report.colorStats
  };
  return `B"H. Strict visual QA for MEGA MERKAVA V2.\nFIRST LINE ONLY: PASS - acceptable OR NOT PASS\nThen max 5 concrete fixable issues.\nLook for nested flex/grid/flex, overflow clipping, z-index overlap, box shadows, rotate/scale/translate, sticky simulation, mixed text alignment/sizes, SVG, ImageData/tiled pattern, dark controls, worker/offscreen canvases, WebGL texture/program witness.\nCompact report:\n${JSON.stringify(compact, null, 2)}`;
}

function readKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
