// B"H
const assert = require("assert");
const { routeTable } = require("../table.js");

function normalize(route) {
  return String(route || "").replace(/^\/+|\/+$/g, "");
}

const seen = new Map();
for (const route of Object.keys(routeTable)) {
  const key = normalize(route);
  assert(!seen.has(key), `duplicate normalized route ${key}: ${seen.get(key)} and ${route}`);
  seen.set(key, route);
}
assert(routeTable["fs/:tunnelName"], "protected fs route exists");
assert(!routeTable["fs/:tunnelName/"], "protected fs trailing duplicate removed");
assert(routeTable["fs/awtsmoos-os"], "virtual os route exists");
assert(!routeTable["fs/awtsmoos-os/"], "virtual os trailing duplicate removed");
console.log("BHY tunnel control route table duplicate tests passed", seen.size);
