// B"H
/**
 * @file probe-url-env.cjs
 * @description Chapter 71: a small lantern for the URL collector. It asks the
 * tunnel runtime what files it truly pulled from localhost, so the Awtsmoos can
 * reveal whether the virtual browser received the whole game or only the gate.
 */
const { buildRuntimeUrlEnv } = require("../../runtimeUrlEnv.js");

async function main() {
  const url = "http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json";
  const env = await buildRuntimeUrlEnv({ url, maxFiles: 140, maxBytes: 1024 * 1024 });
  const files = Object.keys(env.files || {}).sort();
  const sample = Object.fromEntries(files.slice(0, 40).map(name => [name, String(env.files[name]).slice(0, 120)]));
  console.log(JSON.stringify({ ok: env.ok, entry: env.entry, count: files.length, files, sample }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
