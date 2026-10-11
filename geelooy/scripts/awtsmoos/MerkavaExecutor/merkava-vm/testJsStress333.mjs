// B"H — Merkava JS Engine 333+ stress-test suite runner.
// Drives every test through the REAL pipeline: JS source -> MerkavaASTParser
// -> bytecode -> custom Merkava VM. No mocks. Beyond the 666: stress/edge cases.
import pkg from '../merkava-binary/MerkavaJsRunner.js';
import { tests as s1 } from './tests333/s1-recursion.mjs';
import { tests as s2 } from './tests333/s2-massive-data.mjs';
import { tests as s3 } from './tests333/s3-closures.mjs';
import { tests as s4 } from './tests333/s4-prototypes.mjs';
import { tests as s5 } from './tests333/s5-numbers.mjs';
import { tests as s6 } from './tests333/s6-regex.mjs';
import { tests as s7 } from './tests333/s7-strings.mjs';
import { tests as s8 } from './tests333/s8-patterns.mjs';
import { tests as s9 } from './tests333/s9-memory.mjs';
import { tests as s10 } from './tests333/s10-fuzz.mjs';
import { writeFileSync } from 'fs';

const { runJsCode } = pkg;
const tiers = [
  { name: 'S1 recursion', tests: s1 },
  { name: 'S2 massive-data', tests: s2 },
  { name: 'S3 closures', tests: s3 },
  { name: 'S4 prototypes', tests: s4 },
  { name: 'S5 numbers', tests: s5 },
  { name: 'S6 regex', tests: s6 },
  { name: 'S7 strings', tests: s7 },
  { name: 'S8 patterns', tests: s8 },
  { name: 'S9 memory', tests: s9 },
  { name: 'S10 fuzz', tests: s10 },
];

const all = tiers.flatMap(t => t.tests.map(x => ({ ...x, tier: t.name })));
all.forEach((t, i) => { t.n = i + 1; });
console.log(`Total stress tests: ${all.length}`);

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
  const TIMEOUT_MS = 60000;
  // Generous budgets for stress tests: 100k-element loops need millions of steps.
  const opts = { cycles: 5000000, globals: { __merkavaMaxSteps: 50000000, __merkavaMaxDepth: 10000 } };
  let outcome;
  try {
    outcome = await Promise.race([
      runJsCode(t.src, opts).then(r => ({ r })).catch(e => ({ e })),
      new Promise(res => setTimeout(() => res({ timeout: true }), TIMEOUT_MS)),
    ]);
  } catch (e) { outcome = { e }; }
  if (outcome.timeout) return { pass: false, why: 'TIMEOUT' };
  if (outcome.e) return { pass: false, why: 'THREW: ' + String(outcome.e.message || outcome.e).slice(0, 120) };
  const r = outcome.r;
  if (!r.ok) return { pass: false, why: 'NOT-OK: ' + String(r.error || '').slice(0, 120) };
  const v = (r.globals && Object.prototype.hasOwnProperty.call(r.globals, '__awtsmoosResult'))
    ? r.globals.__awtsmoosResult : r.result;
  const pass = eq(v, t.expect);
  return { pass, why: pass ? '' : `expected ${fmt(t.expect)} got ${fmt(v)}` };
}

const orig = {};
for (const k of ['log', 'warn', 'error', 'debug', 'info']) { orig[k] = console[k]; console[k] = () => {}; }

const results = [];
for (const t of all) {
  const r = await runOne(t);
  results.push({ n: t.n, tier: t.tier, name: t.name, pass: r.pass, why: r.why });
}

for (const k of Object.keys(orig)) console[k] = orig[k];

const byTier = {};
for (const r of results) {
  byTier[r.tier] = byTier[r.tier] || { pass: 0, total: 0 };
  byTier[r.tier].total++;
  if (r.pass) byTier[r.tier].pass++;
}
for (const [tier, s] of Object.entries(byTier)) {
  console.log(`${tier}: ${s.pass}/${s.total} ${s.pass === s.total ? 'PASS' : 'FAIL'}`);
}
const fails = results.filter(r => !r.pass);
console.log(`\nTOTAL: ${results.length - fails.length}/${results.length} pass`);
if (fails.length) {
  console.log('\nFAILURES:');
  for (const f of fails.slice(0, 40)) console.log(`  #${f.n} [${f.tier}] ${f.name}: ${f.why}`);
  if (fails.length > 40) console.log(`  ... and ${fails.length - 40} more`);
}
try {
  writeFileSync('/home/hatch/workspace/site-audit/merkava-js333-report.json', JSON.stringify({ total: results.length, pass: results.length - fails.length, byTier, fails: fails.map(f => ({ n: f.n, tier: f.tier, name: f.name, why: f.why })) }, null, 2));
  console.log('Report: /home/hatch/workspace/site-audit/merkava-js333-report.json');
} catch {}
process.exit(fails.length ? 1 : 0);
