// B"H
/**
 * Eight-round MiniMax council audit. Each round asks a strict main judge plus
 * five imaginary specialist sub-agents to name concrete remaining issues. The
 * Awtsmoos records every verdict so repairs can answer evidence, not vibes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/layout-labyrinth');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const imagePath = path.join(outDir, 'layout-labyrinth.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const report = JSON.parse(fs.readFileSync(path.join(outDir, 'layout-labyrinth-report.json'), 'utf8'));
const compact = { pass: report.pass, image: report.image, checks: report.checks, textureCount: report.textures.length, colorStats: report.colorStats };
const answers = [];
for (let round = 1; round <= 8; round++) {
  const answer = await auditRound(round);
  answers.push({ round, answer });
  fs.writeFileSync(path.join(outDir, `minimax-8x-round-${round}.md`), answer);
}
const summary = summarize(answers);
fs.writeFileSync(path.join(outDir, 'minimax-8x-summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outDir, 'minimax-8x-all.md'), answers.map(a => `# Round ${a.round}\n\n${a.answer}`).join('\n\n---\n\n'));
console.log(JSON.stringify(summary, null, 2));

async function auditRound(round) {
  const prompt = `B"H. Round ${round}/8 strict visual QA for attached LAYOUT LABYRINTH renderer stress image.\n\nReturn this exact structure:\nVERDICT: PASS or NOT PASS\nSCORE: 0-100\nMAIN ISSUES: up to 5 specific visual defects\nSUBAGENTS:\n- LayoutAgent: one paragraph\n- CanvasAgent: one paragraph\n- WebGLAgent: one paragraph\n- SVGAgent: one paragraph\n- HumanAuditAgent: one paragraph\nFIX PRIORITY: numbered list of concrete fixes.\n\nBe harsh. Do not reward internal gates alone. Judge screenshot readability, deep nested flex/grid clarity, unused space, SVG density, WebGL cube state, overflow/scrollbar clarity, transform labels, real UI corpus, and phone-scale human auditability.\n\nCompact report:\n${JSON.stringify(compact, null, 2)}`;
  const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.12, max_tokens:1400 };
  const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
  const text = await res.text();
  fs.writeFileSync(path.join(outDir, `minimax-8x-round-${round}.raw.txt`), text);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch {}
  const answer = parsed?.choices?.[0]?.message?.content || text;
  return `HTTP ${res.status}\n\n${answer}`;
}

function summarize(items) {
  const joined = items.map(i => i.answer).join('\n').toLowerCase();
  const topics = ['small labels', 'tiny', 'unused space', 'webgl', 'svg', 'overflow', 'transform', 'grid', 'flex', 'right column', 'readability', 'phone', 'ui corpus'];
  return {
    rounds: items.length,
    passCount: items.filter(i => /verdict:\s*pass/i.test(i.answer)).length,
    notPassCount: items.filter(i => /verdict:\s*not pass/i.test(i.answer)).length,
    topicMentions: Object.fromEntries(topics.map(t => [t, count(joined, t)])),
    files: items.map(i => `minimax-8x-round-${i.round}.md`)
  };
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

function readKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
