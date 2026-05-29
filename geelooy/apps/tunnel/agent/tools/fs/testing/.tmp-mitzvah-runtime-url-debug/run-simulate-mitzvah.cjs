// B"H
/**
 * @file run-simulate-mitzvah.cjs
 * @description Chapter 73: a guarded direct invocation of the tunnel runtime.
 * Even if Merkava throws outside the normal return path, this script captures
 * the shard and prints structured JSON so the next repair has a true name.
 */
const { buildRuntimeActions } = require("../../actionGroups/runtimeActions.js");

function compact(error, kind) {
  return { ok: false, kind, name: error?.name || "Error", message: error?.message || String(error), stack: String(error?.stack || "").split("\n").slice(0, 12).join("\n") };
}

async function main() {
  const payload = {
    url: "http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json",
    maxFiles: 420,
    maxBytes: 1024 * 1024,
    waitMs: 1800,
    timeoutMs: 120000,
    returnValues: ["window.__AWTSMOOS_LAST_ERROR__", "window.__awtsmoosResult"]
  };
  const actions = buildRuntimeActions({ payload, config: { root: process.cwd() } });
  let settled = false;
  const fatal = new Promise(resolve => {
    process.once("uncaughtException", error => resolve(compact(error, "uncaughtException")));
    process.once("unhandledRejection", error => resolve(compact(error, "unhandledRejection")));
  });
  const run = actions.simulateRuntime().then(result => {
    settled = true;
    return result;
  }).catch(error => compact(error, "caughtException"));
  const result = await Promise.race([run, fatal]);
  const summary = result.ok === false && !result.input ? result : {
    ok: result.ok,
    score: result.score,
    input: result.input,
    errors: result.errors,
    console: result.console,
    values: result.values,
    awtsmoosResult: result.awtsmoosResult,
    filesCount: result.input?.files?.length,
    filesSample: result.input?.files?.slice?.(0, 80),
    domBodyText: result.domSnapshot?.documentElement?.children?.[1]?.textContent || null
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
  if (!settled && result.kind) setTimeout(() => process.exit(1), 10);
}
main().catch(error => {
  console.error(JSON.stringify(compact(error, "mainCatch"), null, 2));
  process.exit(1);
});
