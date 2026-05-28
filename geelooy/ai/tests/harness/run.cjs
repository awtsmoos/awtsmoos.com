#!/usr/bin/env node
//B"H
const modules = {
  css: "./cssParity.cjs",
  extension: "./extensionLedger.cjs",
  extensionAuth: "./extensionAuth.cjs",
  boot: "./boot.cjs",
  payload: "./payloadParity.cjs",
  stores: "./storesAutomation.cjs",
  reload: "./reloadOrdering.cjs",
  stream: "./streamOrdering.cjs",
  liveUi: "./liveStreamingUi.cjs",
  background: "./backgroundAutomation.cjs",
  bfcache: "./extensionBfcachePort.cjs",
  thoughts: "./thoughtGrouping.cjs",
  thoughtDom: "./thoughtDomStability.cjs",
  graph: "./automationGraph.cjs",
  relay: "./relay.cjs",
  relayAuth: "./relayAuth.cjs",
  browser: "./browserDebug.cjs",
  client: "./browserClientSim.cjs",
  memory: "./memoryRetention.cjs",
  static: "./staticAudit.cjs",
  packaging: "./extensionPackaging.cjs"
};

/**
 * B"H — Menu-driven verifier for the Awtsmoos AI cockpit.
 *
 * The harness is a constellation of small gates. Each module checks one vessel,
 * and the `all` command walks every gate so a relay experiment cannot silently
 * darken the plain extension-backed conversation list.
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
  console.log(`B"H Awtsmoos AI harness menu\n\nAvailable:\n  all        run everything\n  css        CSS cascade, entrypoint parity, extension handler counts\n  extension extension background stream ledger stress\n  extensionAuth extension auth and automation failure hardening\n  boot       extension-backed ChatGPT boot/list/error/relay guards\n  payload    manual/automation service payload parity\n  stores     durable stream store, tab identity, automation run store\n  reload     full-history reload before stream resume ordering\n  stream     one assistant record per live stream\n  liveUi     stable streaming text selection and sidebar stream ghosts\n  background extension-owned automation after page closes\n  bfcache    extension port recovery across BFCache restores\n  thoughts   thought text stands alone; following actions group\n  thoughtDom opened thought DOM does not churn during stream\n  graph      automation graph engine and archive fallback\n  relay      local Node relay multi-stream/body/redirect test\n  relayAuth  relay login/session/token redaction and failed-auth stress\n  browser    URL rewrite, login proxy routing, debug command queue\n  client     VM browser-client simulation of injected scripts\n  memory     raw-payload memory-retention boundaries\n  static     duplicate imports, stale handlers, TODO-like regression audit\n  packaging  extension zip includes service-worker dependencies\n\nExamples:\n  node tests/harness/run.cjs all\n  AWTSMOOS_AI_TEST_ROUNDS=5 node tests/harness/run.cjs all\n`);
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
