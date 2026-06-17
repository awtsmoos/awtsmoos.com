// B"H
const tests = [
  require("./treasuryServices.test.cjs"),
  require("./treasuryRoutes.test.cjs"),
  require("./treasuryHttp.test.cjs")
];

/** B"H: A tiny runner keeps treasury verification independent of frameworks. */
async function main() {
  const results = [];
  for (const test of tests) results.push(await test.run());
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}
main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
