// B"H
import assert from "node:assert/strict";
import { buildAtlasLayout, nextPowerOfTwo } from "../atlas-layout.js";

const atlas = {
  names: () => ["a", "b", "c"],
  get: name => ({ a: { width: 16, height: 8 }, b: { width: 10, height: 10 }, c: { width: 9, height: 300 } })[name]
};
const layout = buildAtlasLayout(atlas);
assert.deepEqual(layout.names(), ["a", "b", "c"]);
assert.equal(layout.get("a").w, 16);
assert.ok(layout.height >= 300);
assert.equal(nextPowerOfTwo(257), 512);
assert.ok(layout.get("c").v1 <= 1);
console.log("atlas layout ok");
