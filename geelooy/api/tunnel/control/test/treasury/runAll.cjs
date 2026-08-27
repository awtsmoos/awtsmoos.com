// B"H
const tests = [
  require("./productServices.test.cjs"),
  require("./integrationGuards.test.cjs"),
  require("./productRoutes.test.cjs"),
  require("./aliasRoutes.test.cjs"),
  require("./uiRender.test.cjs"),
  require("./graphRouteRender.test.cjs"),
  require("./crossSurfaceSync.test.cjs")
];

/** B"H: Product treasury runner for monetization, UI, routes, graph, trust, and surface sync. */
async function main() {
  const results = [];
  for (const test of tests) results.push(await test.run());
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}
main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
