// B"H — Merkava JS Engine 666-test suite runner.
// Drives every test through the REAL pipeline: JS source -> MerkavaASTParser
// -> bytecode -> custom Merkava VM (merkava-vm). No mocks.
import pkg from '../merkava-binary/MerkavaJsRunner.js';
import { tests as t1 } from './tests666/tier1-basic.mjs';
import { tests as t2 } from './tests666/tier2-control.mjs';
import { tests as t3 } from './tests666/tier3-functions.mjs';
import { tests as t4 } from './tests666/tier4-objects.mjs';
import { tests as t5 } from './tests666/tier5-arrays.mjs';
import { tests as t6 } from './tests666/tier6-advanced.mjs';
import { writeFileSync } from 'fs';

const { runJsCode } = pkg;
const tiers = [
  { name: 'T1 basic', tests: t1 },
  { name: 'T2 control', tests: t2 },
  { name: 'T3 functions', tests: t3 },
  { name: 'T4 objects', tests: t4 },
  { name: 'T5 arrays', tests: t5 },
  { name: 'T6 advanced', tests: t6 },
];

const all = tiers.flatMap(t => t.tests.map(x => ({ ...x, tier: t.name })));
if (all.length !== 666) {
  console.error(`COUNT MISMATCH: ${all.length} !== 666`);
  process.exit(2);
}
all.forEach((t, i) => { t.n = i + 1; });

function eq(a, b) {
  if (typeof b === 'number') {
    if (Number.isNaN(b)) return typeof a === 'number' && Number.isNaN(a);
    if (!Number.isFinite(b)) return a === b;
    return typeof a === 'number' && Math.abs(a - b) < 1e-9;
  }
  if (b === undefined) return a === undefined;
  if (b === null) return a === null;
  if (typeof b === 'string' || typeof b === 'boolean') return a === b;
  if (Array.isArray(b))
    return Array.isArray(a) && a.length === b.length && a.every((x, i) => eq(x, b[i]));
  if (typeof b === 'object') {
    if (typeof a !== 'object' || a === null || Array.isArray(a)) return false;
    const kb = Object.keys(b), ka = Object.keys(a);
    return kb.length === ka.length && kb.every(k => eq(a[k], b[k]));
  }
  return false;
}

function fmt(v) {
  try {
    const s = JSON.stringify(v);
    return s === undefined ? String(v) : s.slice(0, 120);
  } catch { return `[unserializable ${typeof v}]`; }
}

async function runOne(t) {
  const TIMEOUT_MS = 8000;
  let outcome;
  try {
    outcome = await Promise.race([
      runJsCode(t.src).then(r => ({ r })).catch(e => ({ e })),
      new Promise(res => setTimeout(() => res({ timeout: true }), TIMEOUT_MS)),
    ]);
  } catch (e) { outcome = { e }; }
  if (outcome.timeout) return { pass: false, why: 'TIMEOUT' };
  if (t.kind === 'fails') {
    const ok = !!outcome.e || (outcome.r && !outcome.r.ok);
    return { pass: ok, why: ok ? '' : 'expected failure, got ok value=' + fmt(valOf(outcome.r)) };
  }
  if (outcome.e) return { pass: false, why: 'THREW: ' + String(outcome.e.message || outcome.e).slice(0, 100) };
  const r = outcome.r;
  if (!r.ok) return { pass: false, why: 'NOT-OK: ' + String(r.error || '').slice(0, 100) };
  if (t.kind === 'noCrash') return { pass: true, why: '' };
  const v = valOf(r);
  const pass = eq(v, t.expect);
  return { pass, why: pass ? '' : `expected ${fmt(t.expect)} got ${fmt(v)}` };
}

function valOf(r) {
  if (r && r.globals && Object.prototype.hasOwnProperty.call(r.globals, '__awtsmoosResult'))
    return r.globals.__awtsmoosResult;
  return r ? r.result : undefined;
}

// Silence the VM's chatty per-run diagnostics; restore for the report.
const orig = {};
for (const k of ['log', 'warn', 'error', 'debug', 'info']) { orig[k] = console[k]; console[k] = () => {}; }

const results = [];
for (const t of all) {
  const r = await runOne(t);
  results.push({ n: t.n, tier: t.tier, name: t.name, kind: t.kind, pass: r.pass, why: r.why });
}

for (const k of Object.keys(orig)) console[k] = orig[k];

const byTier = {};
for (const r of results) {
  byTier[r.tier] = byTier[r.tier] || { pass: 0, total: 0 };
  byTier[r.tier].total++;
  if (r.pass) byTier[r.tier].pass++;
}
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass);

console.log('=== MERKAVA JS ENGINE: 666 TESTS ===');
console.log('Pipeline: JS -> MerkavaASTParser -> bytecode -> custom Merkava VM (real, no mocks)');
for (const [tier, s] of Object.entries(byTier))
  console.log(`${tier}: ${s.pass}/${s.total} pass`);
console.log(`\nTOTAL: ${passed}/666 pass (${(passed / 666 * 100).toFixed(1)}%)`);
if (failed.length) {
  console.log(`\nFAILURES (${failed.length}):`);
  for (const f of failed.slice(0, 60))
    console.log(`  #${f.n} [${f.tier}/${f.kind}] ${f.name} :: ${f.why}`);
  if (failed.length > 60) console.log(`  ... and ${failed.length - 60} more`);
}

const report = {
  total: 666, passed, failed: failed.length,
  tiers: byTier,
  failures: failed.map(f => ({ n: f.n, tier: f.tier, kind: f.kind, name: f.name, why: f.why })),
  limitations: results.filter(r => r.kind !== 'eq' && r.pass).map(r => ({ n: r.n, kind: r.kind, name: r.name })),
};
writeFileSync('/home/hatch/workspace/site-audit/merkava-js666-report.json', JSON.stringify(report, null, 2));
console.log('\nReport: ~/workspace/site-audit/merkava-js666-report.json');
process.exit(failed.length ? 1 : 0);
