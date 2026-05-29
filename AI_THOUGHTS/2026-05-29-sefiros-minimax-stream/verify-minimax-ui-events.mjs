//B"H
import { normalizeMessage } from "../../geelooy/ai/js/render/messageNormalizer.js";
import { visibleRenderableEvents } from "../../geelooy/ai/js/render/runtime/eventRuntime.js";
import { reasoningEvent, toolCallEvent, toolResultEvent, providerStreamEvent } from "../../geelooy/ai/central/providerEvents.js";

globalThis.document ||= { documentElement: { hasAttribute: () => false }, body: { classList: { toggle() {} } } };

const packet = {
  role: "assistant",
  text: "# Final **answer**",
  awtsmoos: {
    otherEvents: [
      providerStreamEvent({ label: "sse data", raw: { id: "s", choices: [{ delta: { content: "raw chunk" } }] }, sequence: 1 }, "minimax"),
      reasoningEvent("thinking grows", "minimax"),
      toolCallEvent({ id: "c1", name: "read", arguments: { p: "." } }, "minimax"),
      toolResultEvent({ id: "c1", name: "read" }, { ok: true, content: "ok" }, "minimax")
    ]
  }
};

const normalized = normalizeMessage(packet);
const visible = visibleRenderableEvents(normalized.events);
console.log(JSON.stringify({ all: normalized.events.map(e => e.kind), visible: visible.map(e => e.kind), toolGroup: visible.find(e => e.kind === "tool_group")?.raw?.events?.map(e => e.kind) }, null, 2));
if (visible.some(e => e.kind === "provider_stream")) throw new Error("provider stream leaked into UI");
if (!visible.some(e => e.kind === "thinking")) throw new Error("missing visible thinking");
const group = visible.find(e => e.kind === "tool_group");
if (!group) throw new Error("missing collapsed tool group");
for (const kind of ["tool_call", "tool_result"]) {
  if (!group.raw.events.some(e => e.kind === kind)) throw new Error(`missing ${kind} inside tool group`);
}
