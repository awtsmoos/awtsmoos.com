// B"H
/**
 * Rebuilds the runtime stress manifest from the latest matrix result.
 */
const fs = require('fs');

const matrixPath = 'AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json';
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const failed = matrix.rows.filter(row => !row.ok);
const slow = matrix.rows.filter(row => row.ms > 5000);
const now = new Date().toISOString();

const text = [
  'B"H',
  'Merkava runtime stress manifest',
  `Generated: ${now}`,
  '',
  'Scope:',
  '- geelooy/apps/*/index.html',
  '- geelooy/games/*/index.html',
  '',
  'Boundary:',
  '- Actual app/game source workarounds were reverted.',
  '- Remaining runtime-related changes are limited to the tunnel/tunnel-control system and MerkavaExecutor.',
  '- Fake THREE fallbacks remain removed; real files/import maps are used.',
  '',
  `Summary: ${matrix.ok}/${matrix.total} passed, ${matrix.failed} failed, ${matrix.count} tested.`,
  `Caps: collect=${matrix.caps?.collectMs || 'unknown'}ms runtime=${matrix.caps?.runtimeMs || 'unknown'}ms`,
  '',
  'Failures:',
  ...(failed.length ? failed.map(row => `- ${row.p} :: ${row.error}`) : ['- none']),
  '',
  'Slow but passing rows:',
  ...(slow.length ? slow.map(row => `- ${row.p} :: ${row.ms}ms :: files=${row.fileCount}`) : ['- none']),
  '',
  'Regression proof:',
  '- AI_THOUGHTS/runtime-stress/runtime-regression-tests.json',
  '- AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json',
  '- AI_THOUGHTS/runtime-stress/direct-runtime-matrix.jsonl',
  '',
  'Key simulator fixes:',
  '- Source collector split into small modules.',
  '- Collector ignores strings/templates/comments/regex literals and CommonJS require().',
  '- Inline module script bodies are scanned as JavaScript, not raw HTML.',
  '- Real import-map pass-through is preserved.',
  '- DOM raw script text, Element.append/prepend/before/after, and async error capture are supported.',
  '- Matrix cap adjusted to measured runtime reality without modifying game source.',
  ''
].join('\n');

function q(value) {
  return JSON.stringify(String(value ?? ''));
}

const yaml = [
  'bh: "B\\"H"',
  `generated_at: ${q(now)}`,
  'scope:',
  '  - "geelooy/apps/*/index.html"',
  '  - "geelooy/games/*/index.html"',
  'boundary:',
  '  app_game_source_workarounds_reverted: true',
  '  fake_three_fallbacks: "removed"',
  'summary:',
  `  total: ${matrix.total}`,
  `  tested: ${matrix.count}`,
  `  passed: ${matrix.ok}`,
  `  failed: ${matrix.failed}`,
  'caps:',
  `  collect_ms: ${matrix.caps?.collectMs || 0}`,
  `  runtime_ms: ${matrix.caps?.runtimeMs || 0}`,
  'failures:',
  ...(failed.length ? failed.map(row => `  - path: ${q(row.p)}\n    error: ${q(row.error)}`) : ['  []']),
  'slow_but_passing:',
  ...(slow.length ? slow.map(row => `  - path: ${q(row.p)}\n    ms: ${Number(row.ms || 0)}\n    file_count: ${Number(row.fileCount || 0)}`) : ['  []']),
  'result_files:',
  '  - "AI_THOUGHTS/runtime-stress/runtime-regression-tests.json"',
  '  - "AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json"',
  '  - "AI_THOUGHTS/runtime-stress/direct-runtime-matrix.jsonl"',
  ''
].join('\n');

fs.writeFileSync('AI_THOUGHTS/runtime-stress/manifest.txt', text);
fs.writeFileSync('AI_THOUGHTS/runtime-stress/manifest.yaml', yaml);
console.log(JSON.stringify({ txt: 'AI_THOUGHTS/runtime-stress/manifest.txt', yaml: 'AI_THOUGHTS/runtime-stress/manifest.yaml', summary: { total: matrix.total, ok: matrix.ok, failed: matrix.failed } }, null, 2));
