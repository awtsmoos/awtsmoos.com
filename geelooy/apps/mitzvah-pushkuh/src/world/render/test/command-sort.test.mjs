// B"H
import assert from "node:assert/strict";
import { sortCommands } from "../command-sort.js";

const imgA = { awtsmoosTextureKey: "b" }, imgB = { awtsmoosTextureKey: "a" };
const items = [
  { op: "sprite", img: imgA, mode: "lighter", layer: 2, material: "m", depth: 9 },
  { op: "rect", fill: "#fff", mode: "source-over", layer: 1, material: "m", depth: 3 },
  { op: "sprite", img: imgB, mode: "lighter", layer: 2, material: "m", depth: 1 }
];
sortCommands(items);
assert.equal(items[0].op, "rect");
assert.equal(items[1].img, imgB);
assert.equal(items[2].img, imgA);
console.log("command sort ok");
