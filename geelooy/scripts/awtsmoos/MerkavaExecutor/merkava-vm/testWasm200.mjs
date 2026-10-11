// B"H — Merkava WASM aggressive test suite: 200+ tests across 11 tiers.
// Usage: node testWasm200.mjs [--tier=X] [--xcheck] [--quiet]
//   --xcheck : force native cross-check on every runnable test (slow)
import * as runnerApi from './wasm/wasmRunner.js';
import { parseModule } from './wasm/wasmParser.js';
import { instantiate } from './wasm/wasmExecutor.js';

const api = { ...runnerApi, parseModule, instantiate };

import { tests as tA } from './testsWasm/tierA-wat.mjs';
import { tests as tB } from './testsWasm/tierB-parser.mjs';
import { tests as tC } from './testsWasm/tierC-i32.mjs';
import { tests as tD } from './testsWasm/tierD-i64.mjs';
import { tests as tE } from './testsWasm/tierE-float.mjs';
import { tests as tF } from './testsWasm/tierF-control.mjs';
import { tests as tG } from './testsWasm/tierG-calls.mjs';
import { tests as tH } from './testsWasm/tierH-memory.mjs';
import { tests as tI } from './testsWasm/tierI-globals-convert.mjs';
import { tests as tJ } from './testsWasm/tierJ-programs.mjs';
import { tests as tK } from './testsWasm/tierK-traps.mjs';

const tiers = [
  ['A-wat', tA], ['B-parser', tB], ['C-i32', tC], ['D-i64', tD],
  ['E-float', tE], ['F-control', tF], ['G-calls', tG], ['H-memory', tH],
  ['I-globals-conv', tI], ['J-programs', tJ], ['K-traps', tK],
];

const args = process.argv.slice(2);
const onlyTier = (args.find((a) => a.startsWith('--tier=')) || '').slice(7) || null;
const forceXcheck = args.includes('--xcheck');
const quiet = args.includes('--quiet');

function fmt(v) {
  if (typeof v === 'bigint') return v.toString() + 'n';
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  if (Object.is(v, -0)) return '-0';
  return String(v);
}

function eq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => eq(x, b[i]));
  }
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Object.is(a, b);
  }
  return a === b;
}

async function runTest(t) {
  const t0 = Date.now();
  try {
    if (t.check) {
      const r = await t.check(api);
      return { fail: r && r.pass ? null : ((r && r.why) || 'check failed'), ms: Date.now() - t0 };
    }
    const bytes = api.compileWatToBytes(t.wat);
    if (t.onlyValidate) {
      api.parseModule(bytes);
      return { fail: null, ms: Date.now() - t0 };
    }
    if (t.checkTypes) {
      const m = api.parseModule(bytes);
      if (m.types.length !== t.checkTypes) {
        return { fail: `type count ${m.types.length} != ${t.checkTypes}`, ms: Date.now() - t0 };
      }
    }
    let inst = null;
    let err = null;
    try {
      inst = api.instantiateBytes(bytes, t.imports || {}, t.instOpts || {});
    } catch (e) { err = e; }
    if (t.expectTrap) {
      if (!err) {
        try { api.callExport(inst, t.export, t.args || []); }
        catch (e2) { err = e2; }
      }
      if (!err) return { fail: 'expected trap, none thrown', ms: Date.now() - t0 };
      if (typeof t.expectTrap === 'string' && err.code !== t.expectTrap) {
        return { fail: `trap code '${err.code}' != '${t.expectTrap}'`, ms: Date.now() - t0 };
      }
      return { fail: null, ms: Date.now() - t0 };
    }
    if (err) return { fail: 'instantiate threw: ' + (err.code || err.message), ms: Date.now() - t0 };
    let got;
    try { got = api.callExport(inst, t.export, t.args || []); }
    catch (e) { return { fail: 'call threw: ' + (e.code || e.message), ms: Date.now() - t0 }; }
    if (!eq(got, t.expect)) return { fail: `got ${fmt(got)} want ${fmt(t.expect)}`, ms: Date.now() - t0 };
    if (t.xcheck || forceXcheck) {
      const nv = api.nativeValidate(bytes);
      if (!nv.supported) return { fail: 'native WebAssembly unavailable', ms: Date.now() - t0 };
      if (!nv.valid) return { fail: 'NATIVE VALIDATION FAILED', ms: Date.now() - t0 };
      let ngot;
      try { ngot = await api.nativeCall(bytes, t.export, t.args || [], t.imports || {}); }
      catch (e) { return { fail: 'native call threw: ' + e.message, ms: Date.now() - t0 }; }
      const ngotArr = Array.isArray(ngot) ? ngot : [ngot];
      if (!eq(ngotArr, got)) return { fail: `NATIVE ${fmt(ngotArr)} != OURS ${fmt(got)}`, ms: Date.now() - t0 };
    }
    return { fail: null, ms: Date.now() - t0 };
  } catch (e) {
    return { fail: 'harness threw: ' + (e && e.message), ms: Date.now() - t0 };
  }
}

let total = 0, passed = 0, failed = 0;
const failures = [];
const tierTimes = [];

for (const [tierName, tests] of tiers) {
  if (onlyTier && tierName !== onlyTier) continue;
  const t0 = Date.now();
  let tp = 0, tf = 0;
  for (const t of tests) {
    total++;
    const { fail, ms } = await runTest(t);
    if (fail) {
      failed++; tf++;
      failures.push(`[${tierName}] ${t.name}: ${fail}`);
      if (!quiet) console.log(`FAIL [${tierName}] ${t.name}: ${fail}`);
    } else {
      passed++; tp++;
    }
    if (ms > 2000 && !quiet) console.log(`  (slow: [${tierName}] ${t.name} took ${ms}ms)`);
  }
  tierTimes.push([tierName, tests.length, tp, tf, Date.now() - t0]);
}

console.log('\n=== WASM TEST RESULTS ===');
for (const [n, count, tp, tf, ms] of tierTimes) {
  console.log(`Tier ${n}: ${tp}/${count} passed${tf ? ` (${tf} FAILED)` : ''} [${ms}ms]`);
}
console.log(`\nTOTAL: ${passed}/${total} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
}
