#!/usr/bin/env node
//B"H
const modules = {
  css: "./cssParity.cjs",
  extension: "./extensionLedger.cjs",
  stores: "./storesAutomation.cjs",
  relay: "./relay.cjs",
  browser: "./browserDebug.cjs",
  client: "./browserClientSim.cjs",
  static: "./staticAudit.cjs"
};

/**
 * B"H — Menu-driven verifier for the Awtsmoos AI cockpit.
 *
 * Usage:
 *   node tests/harness/run.cjs all
 *   node tests/harness/run.cjs css extension stores relay
 *   node tests/harness/run.cjs menu
 */
async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("menu")) return printMenu();
  const selected = args.includes("all") ? Object.keys(modules) : args;
  const rounds = Number(process.env.AWTSMOOS_AI_TEST_ROUNDS || 1);
  const results = [];
  for (let round = 1; round <= rounds; round++) {
    for (const name of selected) {
      if (!modules[name]) throw new Error(`Unknown harness: ${name}`);
      const result = await require(modules[name]).run();
      results.push({ round, ...result });
      console.log(`${result.ok ? "✓" : "✗"} [${round}] ${result.name} ${result.ms}ms`);
      if (!result.ok) console.error(result.error, result.facts || {});
    }
  }
  const failed = results.filter(r => !r.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, total: results.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

function printMenu() {
  console.log(`B"H Awtsmoos AI harness menu\n\nAvailable:\n  all        run everything\n  css        CSS cascade, entrypoint parity, extension handler counts\n  extension extension background stream ledger stress\n  stores     durable stream store, tab identity, automation run store\n  relay      local Node relay multi-stream/body/redirect test\n  browser    URL rewrite, login proxy routing, debug command queue\n  client     VM browser-client simulation of injected scripts\n  static     duplicate imports, stale handlers, TODO-like regression audit\n\nExamples:\n  node tests/harness/run.cjs all\n  AWTSMOOS_AI_TEST_ROUNDS=5 node tests/harness/run.cjs all\n`);
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
