// B"H
import assert from "node:assert/strict";
import { createCommandBuffer } from "../commands.js";

const b = createCommandBuffer();
b.rect(0, 0, 1, 1, "#fff");
const first = b.items[0];
assert.equal(b.count(), 1);
b.clear();
assert.equal(b.count(), 0);
b.rect(0, 0, 2, 2, "#000");
assert.equal(b.items[0], first);
assert.ok(b.poolStats().reused >= 1);
console.log("command pool ok");
