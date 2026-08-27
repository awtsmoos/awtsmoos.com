//B"H
import assert from "node:assert/strict";
import { displayableThoughtInnerEvents } from "../js/render/runtime/thoughtInnerEvents.js";

const rawInner = [
  { kind: "status", label: "Stream complete", text: "Stream complete." },
  { kind: "awtsmoos_tool", label: "tool", raw: { type: "tool_call", id: "tool-1", name: "search" } },
  { kind: "raw", label: "blank", raw: {} },
  { kind: "function_result", label: "result", raw: { dataNoJSON: "ok", id: "result-1" } }
];

const displayable = displayableThoughtInnerEvents(rawInner);
assert.equal(displayable.length, 2, "only useful inner events should survive");
assert.equal(displayable[0].raw.id, "tool-1", "order of useful inner events should be preserved");
assert.equal(displayable[1].raw.id, "result-1", "second useful inner event should remain second");

console.log("B'H thought inner event extraction contract passed");
