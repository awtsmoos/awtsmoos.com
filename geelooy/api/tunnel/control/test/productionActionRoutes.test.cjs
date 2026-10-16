// B"H
// The production entry must register guarded execution, not discovery alone.
const test = require("node:test");
const assert = require("node:assert/strict");
const entry = require("../_awtsmoos.derech.js");

test("production mounts protected native and Virtual OS action routes", async () => {
  const routes = new Map();
  await entry.dynamicRoutes({use: async (name, handler) => {
    assert.equal(routes.has(name), false, `duplicate route: ${name}`);
    routes.set(name, handler);
  }});
  for (const name of ["my-device", "fs/awtsmoos-os", "fs/:tunnelName", "devices", "docs", "docs.json", "openapi", "simple/cmd", "simple/result"]) {
    assert.equal(typeof routes.get(name), "function", `missing production route: ${name}`);
  }
});
