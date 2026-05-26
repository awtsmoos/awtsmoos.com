#!/usr/bin/env node
/**
 * B"H
 * Menu-independent Emerald simulation tests.
 */
import { runTest } from './assertions.js';
import {
  assertFeatureData,
  assertMenuRoute,
  assertNpcData,
  assertNpcInteractions,
  assertWorldCounts,
  loadEmerald,
  summarizeWorld
} from './emeraldHarness.js';

function repeatArg() {
  const arg = process.argv.find(x => x.startsWith('--repeat='));
  const n = Number(arg?.split('=')[1] || 12);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 500) : 12;
}

async function main() {
  let world;
  const repeat = repeatArg();
  const tests = [
    ['load emerald world', async () => { world = await loadEmerald('load'); return summarizeWorld(world); }],
    ['world counts', async () => assertWorldCounts(world || await loadEmerald('counts'))],
    ['npc data', async () => assertNpcData(world || await loadEmerald('npc-data'))],
    ['npc interactions', async () => assertNpcInteractions(world || await loadEmerald('npc-interactions'))],
    ['feature data', async () => assertFeatureData(world || await loadEmerald('features'))],
    ['menu route and css', async () => assertMenuRoute()],
    ['multi-run deterministic simulation', async () => {
      const summaries = [];
      for (let i = 0; i < repeat; i++) {
        summaries.push(summarizeWorld(await loadEmerald(`stress-${i}`)));
      }
      const baseline = JSON.stringify(summaries[0]);
      const stable = summaries.every(s => JSON.stringify(s) === baseline);
      if (!stable) throw new Error('Emerald summaries changed across repeated imports');
      return { runs: summaries.length, baseline: summaries[0] };
    }]
  ];

  const results = [];
  for (const [name, fn] of tests) {
    const result = await runTest(name, fn);
    results.push(result);
    console.log(`${result.ok ? '✅' : '❌'} ${name} (${result.durationMs}ms)`);
    if (!result.ok) console.log(JSON.stringify(result, null, 2));
  }

  const failed = results.filter(r => !r.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, repeat, total: results.length, failed: failed.length, results }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
