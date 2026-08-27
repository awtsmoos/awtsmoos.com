// B"H
/**
 * Command routing test: sorting changes procession order, but stats stay true.
 */
import assert from "node:assert/strict";
import { createCommandBuffer } from "../commands.js";
import { executeWebGLCommands } from "../webgl-commands.js";

const calls = [];
const gl = { drawingBufferWidth: 320, drawingBufferHeight: 180, canvas: { width: 320, height: 180 } };
const buffer = createCommandBuffer();
buffer.sprite({}, 0, 0, 8, 8, 1, "lighter", { layer: 2, texture: "b" });
buffer.rect(1, 2, 3, 4, "#fff", 1, "source-over", { layer: 1 });
buffer.strokeRect(0, 0, 1, 1);
const pipelines = {
  sprites: { begin: (w, h) => calls.push(`sb:${w}x${h}`), push: () => (calls.push("sp"), true), flush: () => calls.push("sf") },
  rects: { begin: (w, h) => calls.push(`rb:${w}x${h}`), push: () => calls.push("rp"), flush: () => calls.push("rf") }
};

const stats = executeWebGLCommands(gl, buffer, pipelines);
assert.equal(stats.drawn, 2);
assert.equal(stats.skipped, 1);
assert.equal(stats.total, 3);
assert.equal(stats.sorted, 3);
assert.equal(buffer.items.length, 0);
assert.deepEqual(calls, ["rb:320x180", "sb:320x180", "sf", "rp", "sp", "sf", "rf"]);
console.log("webgl command routing ok");
