//B"H
import { mergeEvents } from "../../geelooy/ai/js/render/runtime/renderHelpers.js";
import { buildEventTimeline } from "../../geelooy/ai/js/render/runtime/eventTimeline.js";
import { reasoningEvent, toolCallEvent } from "../../geelooy/ai/central/providerEvents.js";

const thoughtA1 = reasoningEvent("A first", "minimax", "round-0");
const tool = toolCallEvent({ id: "c1", name: "read", arguments: { p: "." } }, "minimax");
const thoughtA2 = reasoningEvent("A first plus later full update", "minimax", "round-0");
const thoughtB = reasoningEvent("B new round", "minimax", "round-1");

const merged = mergeEvents([], [thoughtA1]);
const afterTool = mergeEvents(merged, [tool]);
const afterThoughtUpdate = mergeEvents(afterTool, [thoughtA2]);
const afterNextThought = mergeEvents(afterThoughtUpdate, [thoughtB]);
const timeline = buildEventTimeline(afterNextThought);
console.log(JSON.stringify({ merged: afterNextThought.map(e => ({ kind: e.kind, text: e.text, order: e.order, key: e.raw?.streamKey || e.raw?.tool_call_id })), timeline: timeline.map(e => ({ kind: e.kind, text: e.text })) }, null, 2));
const shape = timeline.map(e => e.kind).join(">");
if (shape !== "thinking>tool_group>thinking") throw new Error(`update moved nodes out of order: ${shape}`);
if (!timeline[0].text.includes("later full update")) throw new Error("thought did not update in place");
if (timeline[2].text !== "B new round") throw new Error("new round did not create a later thought");
