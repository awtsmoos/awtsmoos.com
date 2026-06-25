// B"H
import assert from "node:assert/strict";
import { buildAtlasCanvas } from "../atlas-canvas.js";

const draws = [];
const atlas = { names: () => ["a", "b"], get: n => ({ width: n === "a" ? 8 : 4, height: 6, id: n }) };
const packed = buildAtlasCanvas(atlas, (w, h) => ({ width: w, height: h, getContext: () => ({ drawImage: (...args) => draws.push(args) }) }));
assert.equal(packed.ready, true);
assert.equal(draws.length, 2);
assert.equal(packed.get("a").w, 8);
assert.ok(packed.canvas.width >= 256);
console.log("atlas canvas ok");
